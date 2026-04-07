import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  console.log(`[SELLER-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

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

        // Fetch the subscription to get period end
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        const weeklyFee = (sub.items.data[0]?.price?.unit_amount || 100) / 100;

        // Upsert seller_subscriptions
        await supabase.from("seller_subscriptions").upsert({
          reseller_id: resellerId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: "active",
          current_period_end: periodEnd,
          weekly_fee: weeklyFee,
          discount_code: discountCode,
        }, { onConflict: "reseller_id" });

        // Update reseller stripe_customer_id
        await supabase
          .from("resellers")
          .update({ stripe_customer_id: customerId })
          .eq("id", resellerId);

        logStep("Subscription activated", { resellerId, subscriptionId });

        // Create notification
        if (userId) {
          await supabase.from("notifications").insert({
            user_id: userId,
            type: "seller",
            title: "Seller Membership Active",
            body: "Your weekly seller membership is now active. You can start listing tickets!",
          });
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
          .single();

        if (sellerSub) {
          await supabase
            .from("seller_subscriptions")
            .update({ status: "active", current_period_end: periodEnd })
            .eq("stripe_subscription_id", subscriptionId);

          // Re-activate tickets if they were delisted
          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id")
            .eq("id", sellerSub.reseller_id)
            .single();

          if (reseller) {
            await supabase
              .from("tickets")
              .update({ is_active: true })
              .eq("seller_id", reseller.user_id)
              .eq("is_reseller_ticket", true);
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
          .single();

        if (sellerSub) {
          // Set status to past_due
          await supabase
            .from("seller_subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          // IMMEDIATELY delist all seller tickets
          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id")
            .eq("id", sellerSub.reseller_id)
            .single();

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

            // Notify seller
            await supabase.from("notifications").insert({
              user_id: reseller.user_id,
              type: "seller",
              title: "Payment Failed — Tickets Delisted",
              body: "Your weekly seller membership payment failed. All your tickets have been delisted. Please update your payment method to restore your listings.",
            });
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
          .single();

        if (sellerSub) {
          await supabase
            .from("seller_subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", sub.id);

          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id")
            .eq("id", sellerSub.reseller_id)
            .single();

          if (reseller) {
            await supabase
              .from("tickets")
              .update({ is_active: false })
              .eq("seller_id", reseller.user_id)
              .eq("is_reseller_ticket", true);

            await supabase.from("notifications").insert({
              user_id: reseller.user_id,
              type: "seller",
              title: "Seller Subscription Canceled",
              body: "Your seller membership has been canceled. All tickets have been delisted.",
            });
          }

          logStep("Subscription canceled", { subscriptionId: sub.id });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    logStep("Processing error", { error: String(err) });
    return new Response("Processing error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
