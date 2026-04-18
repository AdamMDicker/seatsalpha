import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: jsonHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const reseller_id: string | undefined = body?.reseller_id;
    const delete_user: boolean = body?.delete_user === true;
    if (!reseller_id) {
      return new Response(JSON.stringify({ error: "reseller_id is required" }), { status: 400, headers: jsonHeaders });
    }

    // Fetch reseller to get user_id
    const { data: reseller, error: fetchErr } = await adminClient
      .from("resellers")
      .select("id, user_id, business_name")
      .eq("id", reseller_id)
      .maybeSingle();
    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers: jsonHeaders });
    }
    if (!reseller) {
      return new Response(JSON.stringify({ error: "Reseller not found" }), { status: 404, headers: jsonHeaders });
    }

    // Safety: prevent deleting your own auth user, but allow removing the reseller record
    const isSelf = reseller.user_id === caller.id;

    // Block deletion if there are pending transfers tied to this seller
    const { count: pendingCount } = await adminClient
      .from("order_transfers")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", reseller.user_id)
      .in("status", ["pending", "uploaded", "disputed"]);

    if ((pendingCount || 0) > 0) {
      return new Response(
        JSON.stringify({ error: `Cannot delete: ${pendingCount} unresolved transfer(s) for this seller. Resolve them first.` }),
        { status: 409, headers: jsonHeaders },
      );
    }

    // 1. Delete reseller-owned tickets that have NOT been sold (preserve history of sold ones)
    await adminClient
      .from("tickets")
      .delete()
      .eq("seller_id", reseller.user_id)
      .eq("is_reseller_ticket", true)
      .eq("quantity_sold", 0);

    // 2. Deactivate any remaining (sold) reseller tickets so they stop appearing
    await adminClient
      .from("tickets")
      .update({ is_active: false })
      .eq("seller_id", reseller.user_id)
      .eq("is_reseller_ticket", true);

    // 3. Delete supporting reseller rows (FK cascades not guaranteed)
    await adminClient.from("reseller_application_seats").delete().eq("reseller_id", reseller_id);
    await adminClient.from("reseller_leagues").delete().eq("reseller_id", reseller_id);
    await adminClient.from("seller_subscriptions").delete().eq("reseller_id", reseller_id);

    // 4. Delete the reseller record itself
    const { error: delErr } = await adminClient.from("resellers").delete().eq("id", reseller_id);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: jsonHeaders });
    }

    // 5. Optionally delete the auth user (only if no orders exist for them)
    let userDeleted = false;
    if (delete_user) {
      const { count: orderCount } = await adminClient
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", reseller.user_id);

      if ((orderCount || 0) === 0) {
        const { error: authErr } = await adminClient.auth.admin.deleteUser(reseller.user_id);
        if (!authErr) userDeleted = true;
      }
    }

    return new Response(
      JSON.stringify({ success: true, business_name: reseller.business_name, user_deleted: userDeleted }),
      { headers: jsonHeaders },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { status: 500, headers: jsonHeaders });
  }
});
