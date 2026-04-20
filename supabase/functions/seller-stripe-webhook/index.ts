import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  try {
    console.log(`[SELLER-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
  } catch {
    console.log(`[SELLER-WEBHOOK] ${step}`);
  }
};

async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[SELLER-WEBHOOK] best-effort failure (${label}):`, err);
    return null;
  }
}

async function logSellerWebhookEvent(
  client: ReturnType<typeof createClient>,
  args: {
    stripeEventId: string;
    eventType: string;
    status: string;
    processingMs?: number;
    errorMessage?: string;
    payloadSummary?: Record<string, unknown>;
  },
) {
  try {
    await client.from("stripe_webhook_events").upsert(
      {
        stripe_event_id: args.stripeEventId,
        event_type: args.eventType,
        source: "seller",
        status: args.status,
        processing_ms: args.processingMs ?? null,
        error_message: args.errorMessage ?? null,
        payload_summary: args.payloadSummary ?? null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "stripe_event_id,source" },
    );
  } catch (err) {
    console.error("[SELLER-WEBHOOK] failed to log audit event:", err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("SELLER_STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or SELLER_STRIPE_WEBHOOK_SECRET" });
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("No signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });
  const startedAt = Date.now();

  await logSellerWebhookEvent(supabase, {
    stripeEventId: event.id,
    eventType: event.type,
    status: "received",
    payloadSummary: { livemode: event.livemode },
  });

  // Fast-ack any event we don't handle so Stripe doesn't retry irrelevant events.
  const HANDLED = new Set([
    "checkout.session.completed",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.deleted",
  ]);
  if (!HANDLED.has(event.type)) {
    logStep("Unhandled event type, acknowledging", { type: event.type });
    await logSellerWebhookEvent(supabase, {
      stripeEventId: event.id,
      eventType: event.type,
      status: "ignored",
      processingMs: Date.now() - startedAt,
    });
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Wrap all processing — once signature is valid, always 200 to Stripe.
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const resellerId = session.metadata?.reseller_id;
        const userId = session.metadata?.user_id;
        const discountCode = session.metadata?.discount_code || null;
        if (!resellerId) {
          logStep("No reseller_id in metadata, skipping");
          break;
        }

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        const weeklyFee = (sub.items.data[0]?.price?.unit_amount || 100) / 100;

        const { error: subErr } = await supabase.from("seller_subscriptions").upsert({
          reseller_id: resellerId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: "active",
          current_period_end: periodEnd,
          weekly_fee: weeklyFee,
          discount_code: discountCode,
        }, { onConflict: "reseller_id" });
        if (subErr) logStep("ERROR upserting seller_subscriptions", { error: subErr.message });

        await safe("update reseller stripe_customer_id", () =>
          supabase.from("resellers").update({ stripe_customer_id: customerId }).eq("id", resellerId)
        );

        logStep("Subscription activated", { resellerId, subscriptionId });

        if (userId) {
          await safe("seller activation notification", () =>
            supabase.from("notifications").insert({
              user_id: userId,
              type: "seller",
              title: "Seller Membership Active",
              body: "Your weekly seller membership is now active. You can start listing tickets!",
            })
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        const { data: sellerSub } = await supabase
          .from("seller_subscriptions")
          .select("reseller_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (sellerSub) {
          const { error: updErr } = await supabase
            .from("seller_subscriptions")
            .update({ status: "active", current_period_end: periodEnd })
            .eq("stripe_subscription_id", subscriptionId);
          if (updErr) logStep("ERROR updating seller_subscriptions", { error: updErr.message });

          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id")
            .eq("id", sellerSub.reseller_id)
            .maybeSingle();

          if (reseller) {
            await safe("re-activate seller tickets", () =>
              supabase
                .from("tickets")
                .update({ is_active: true })
                .eq("seller_id", reseller.user_id)
                .eq("is_reseller_ticket", true)
            );
          }

          logStep("Payment succeeded, subscription renewed", { subscriptionId });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const { data: sellerSub } = await supabase
          .from("seller_subscriptions")
          .select("reseller_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (sellerSub) {
          const { error: updErr } = await supabase
            .from("seller_subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);
          if (updErr) logStep("ERROR setting past_due", { error: updErr.message });

          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id")
            .eq("id", sellerSub.reseller_id)
            .maybeSingle();

          if (reseller) {
            const { count } = await supabase
              .from("tickets")
              .update({ is_active: false })
              .eq("seller_id", reseller.user_id)
              .eq("is_reseller_ticket", true)
              .select("id", { count: "exact", head: true });

            logStep("Tickets delisted due to payment failure", {
              subscriptionId,
              userId: reseller.user_id,
              ticketsDelisted: count,
            });

            await safe("seller payment failed notification", () =>
              supabase.from("notifications").insert({
                user_id: reseller.user_id,
                type: "seller",
                title: "Payment Failed — Tickets Delisted",
                body: "Your weekly seller membership payment failed. All your tickets have been delisted. Please update your payment method to restore your listings.",
              })
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const { data: sellerSub } = await supabase
          .from("seller_subscriptions")
          .select("reseller_id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();

        if (sellerSub) {
          const { error: updErr } = await supabase
            .from("seller_subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", sub.id);
          if (updErr) logStep("ERROR setting canceled", { error: updErr.message });

          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id")
            .eq("id", sellerSub.reseller_id)
            .maybeSingle();

          if (reseller) {
            await safe("delist seller tickets on cancel", () =>
              supabase
                .from("tickets")
                .update({ is_active: false })
                .eq("seller_id", reseller.user_id)
                .eq("is_reseller_ticket", true)
            );

            await safe("seller cancellation notification", () =>
              supabase.from("notifications").insert({
                user_id: reseller.user_id,
                type: "seller",
                title: "Seller Subscription Canceled",
                body: "Your seller membership has been canceled. All tickets have been delisted.",
              })
            );
          }

          logStep("Subscription canceled", { subscriptionId: sub.id });
        }
        break;
      }
    }
  } catch (err) {
    logStep("FATAL processing error (acknowledged to Stripe)", {
      eventId: event.id,
      eventType: event.type,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return new Response(JSON.stringify({ received: true, processing_error: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
