import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const RESEND_API_URL = "https://api.resend.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const body = await req.json();

    // Resend sends { type: "email.received", data: { email_id, to, from, subject, ... } }
    if (body.type !== "email.received") {
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email_id, to: recipients } = body.data;

    if (!email_id || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the alias from the recipient (e.g., "order-a1b2c3d4@seats.ca")
    const aliasRecipient = recipients.find((r: string) =>
      r.includes("order-") && r.includes("@seats.ca")
    );

    if (!aliasRecipient) {
      console.log("No order-*@seats.ca recipient found in:", recipients);
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alias = aliasRecipient.trim().toLowerCase();

    // Look up buyer email via database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: transfer, error: transferError } = await supabase
      .from("order_transfers")
      .select("order_id")
      .eq("transfer_email_alias", alias)
      .single();

    if (transferError || !transfer) {
      console.error("Alias not found:", alias, transferError);
      return new Response(JSON.stringify({ error: "Alias not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", transfer.order_id)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", order.user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Buyer email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buyerEmail = profile.email;

    // Fetch the full inbound email from Resend to get body content
    const emailRes = await fetch(`${RESEND_API_URL}/emails/${email_id}`, {
      headers: { Authorization: `Bearer ${resendApiKey}` },
    });

    if (!emailRes.ok) {
      console.error("Failed to fetch email from Resend:", emailRes.status);
      // Fall back to forwarding just the subject
      const subject = body.data.subject || "Ticket Transfer";
      await forwardEmail(resendApiKey, buyerEmail, subject, 
        `<p>You have received a ticket transfer. Please check your Ticketmaster account to accept the tickets.</p>`,
        `You have received a ticket transfer. Please check your Ticketmaster account to accept the tickets.`
      );

      return new Response(JSON.stringify({ forwarded: true, fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullEmail = await emailRes.json();

    // Forward the email to the buyer
    await forwardEmail(
      resendApiKey,
      buyerEmail,
      fullEmail.subject || body.data.subject || "Ticket Transfer",
      fullEmail.html || `<p>${fullEmail.text || "You have received a ticket transfer."}</p>`,
      fullEmail.text || "You have received a ticket transfer."
    );

    console.log(`Forwarded transfer email for alias ${alias} to buyer`);

    return new Response(JSON.stringify({ forwarded: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in resolve-transfer-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function forwardEmail(
  resendApiKey: string,
  to: string,
  subject: string,
  html: string,
  text: string
) {
  const res = await fetch(`${RESEND_API_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Seats.ca Transfers <noreply@seats.ca>",
      to: [to],
      subject: `Fwd: ${subject}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Failed to forward email via Resend:", res.status, err);
    throw new Error(`Failed to forward email: ${res.status}`);
  }
}
