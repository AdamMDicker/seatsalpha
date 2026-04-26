import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date().toISOString();

    // Find all past events
    const { data: pastEvents, error: eventsError } = await supabase
      .from("events")
      .select("id")
      .lt("event_date", now);

    if (eventsError) throw eventsError;

    if (!pastEvents || pastEvents.length === 0) {
      return new Response(JSON.stringify({ message: "No past events found", deactivated: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pastEventIds = pastEvents.map((e) => e.id);

    // Deactivate all active tickets for past events
    const { data: updated, error: updateError } = await supabase
      .from("tickets")
      .update({ is_active: false })
      .in("event_id", pastEventIds)
      .eq("is_active", true)
      .select("id");

    if (updateError) throw updateError;

    const count = updated?.length ?? 0;
    console.log(`Deactivated ${count} tickets for ${pastEventIds.length} past events`);

    return new Response(
      JSON.stringify({ message: `Deactivated ${count} tickets for ${pastEventIds.length} past events`, deactivated: count }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Cleanup error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
