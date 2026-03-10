import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a friendly and helpful customer support assistant for seats.ca — a Canadian ticket marketplace currently in beta.

IMPORTANT KNOWLEDGE BASE:

**About seats.ca**
- seats.ca is a Canadian ticket marketplace focused on providing the lowest fees in the industry.
- Currently in beta, primarily featuring Toronto Blue Jays (MLB) tickets. More teams and leagues are being added soon.
- The platform connects buyers with verified resellers.

**Do I Need a Membership to Buy Tickets?**
- No. Anyone can browse and purchase tickets without a membership.
- However, non-members will pay standard service fees at checkout.
- Members pay ZERO service fees on all ticket purchases.

**Membership**
- seats.ca offers a membership for $20/year (CAD).
- Members pay ZERO service fees on all ticket purchases.
- Non-members pay standard service fees (still lower than competitors like StubHub, Ticketmaster, SeatGeek, Vivid Seats).
- Membership can be purchased on the /membership page.

**How to Buy Tickets**
1. Browse teams/events from the homepage or navigation menu.
2. Select a game to see available tickets with sections, rows, and prices.
3. Choose your tickets and proceed to checkout.
4. Payment is processed securely via Stripe.
5. After purchase, tickets are delivered electronically.

**Service Fees**
- seats.ca has the lowest fees in the industry.
- Members pay $0 in service fees.
- Non-members still pay significantly less than competitors.
- Competitors like StubHub charge 25-30% fees, Ticketmaster 20-25%, SeatGeek 15-20%.

**Refund & Exchange Policy**
- All sales are final once confirmed.
- If an event is cancelled, buyers receive a full refund.
- If an event is postponed or rescheduled, tickets remain valid for the new date.
- Contact support@seats.ca for any issues with your order.

**Becoming a Seller/Reseller**
- Interested sellers can apply through the reseller portal.
- Resellers can upload inventory via CSV or manually.
- Reseller accounts are reviewed and approved by the seats.ca team.
- Contact support@seats.ca to express interest.

**Available Teams (Beta)**
- Currently: Toronto Blue Jays (MLB) and expanding to other MLB, NHL, NBA, NFL, MLS, CFL, and WNBA teams.
- The navigation menu shows which leagues and teams currently have available tickets.

**Contact**
- Email: support@seats.ca
- Website: seats.ca

RULES:
- Be concise and helpful. Keep answers 2-4 sentences when possible.
- Only answer questions related to seats.ca, tickets, and the platform.
- If you don't know something, say so and suggest contacting support@seats.ca.
- Be friendly and professional.
- Use Canadian English spelling.
- Do not make up information not in the knowledge base.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "We're experiencing high demand. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-support error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
