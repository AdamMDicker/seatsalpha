import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1pZQA0uF2YQUd_lO48YB7r42JVJYwXUzRPpt_-NqOdTk/export?format=csv&gid=2040701339";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const GIVEAWAY_KEYWORDS = [
  "bobblehead", "jersey", "hat", "cap", "shirt", "t-shirt", "towel",
  "blanket", "poster", "figurine", "statue", "replica", "magnet",
  "pennant", "flag", "bag", "backpack", "giveaway", "crewneck",
  "hoodie", "toque", "scarf",
];

function parseSeatTrim(s: string): { section: string; row: string | null } {
  // Handle alphanumeric sections like "23B", "W11", "221B", plus optional ", row X,"
  const m = s.match(/^([A-Za-z]?\d+[A-Za-z]?)\s*,?\s*(?:row\s+([A-Za-z0-9]+))?/i);
  return m ? { section: m[1].toUpperCase(), row: m[2] || null } : { section: s.replace(/,/g, "").trim().toUpperCase(), row: null };
}

function parseTime(t: string): { hours: number; minutes: number } {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return { hours: 19, minutes: 7 };
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3]?.toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3]?.toUpperCase() === "AM" && h === 12) h = 0;
  return { hours: h, minutes: min };
}

const MONTH_MAP: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: jsonHeaders });
    }

    const callerId = claimsData.claims.sub as string;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: jsonHeaders });
    }

    const supabase = adminClient;

    console.log("Fetching CSV...");
    const csvRes = await fetch(SHEET_CSV_URL);
    if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`);
    const lines = (await csvRes.text()).split("\n").filter((l) => l.trim());

    // Find header row
    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (lines[i].toLowerCase().includes("date") && lines[i].toLowerCase().includes("opponent")) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) {
      return new Response(JSON.stringify({ success: false, error: "No header row" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const headers = parseCSVLine(lines[headerIdx]).map((h) => h.toLowerCase().trim());

    // Column indices
    const COL = {
      date: headers.findIndex((h) => h.includes("date")),
      time: headers.findIndex((h) => h === "time"),
      opponent: headers.findIndex((h) => h.includes("opponent")),
      promo: headers.findIndex((h) => h.includes("promo")),
      seat: headers.findIndex((h) => h.includes("seat trim") || h.includes("seat")),
      qty: headers.findIndex((h) => h.includes("seats per")),
      price: headers.findIndex((h) => h.includes("per seat")),
    };

    console.log("Columns:", JSON.stringify(COL));

    // Parse all rows into games
    type GameInfo = { gameData: any; tickets: any[] };
    const gameMap = new Map<string, GameInfo>();

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const c = parseCSVLine(lines[i]);
      const dateStr = c[COL.date]?.trim() || "";
      const timeStr = c[COL.time]?.trim() || "";
      const opponent = c[COL.opponent]?.trim() || "";
      const promo = c[COL.promo]?.trim() || "";
      const seatTrim = c[COL.seat]?.trim() || "";
      const priceStr = c[COL.price]?.trim() || "";

      if (!dateStr || !opponent || !seatTrim || dateStr.toLowerCase().includes("date")) continue;
      if (opponent.toUpperCase().includes("SWAP")) continue;

      const price = parseFloat(priceStr.replace(/[$,]/g, ""));
      if (isNaN(price) || price <= 0) continue;

      const qty = parseInt(c[COL.qty]?.trim() || "2") || 2;
      const { section, row } = parseSeatTrim(seatTrim);
      if (!section) continue;

      // Import all sections (no level restriction)

      // Parse date
      const dm = dateStr.match(/^(\w+)\s+(\d+)/);
      if (!dm) continue;
      const monthNum = MONTH_MAP[dm[1].toLowerCase()];
      if (monthNum === undefined) continue;
      const { hours, minutes } = parseTime(timeStr);
      // Times in the sheet are Eastern Time — convert to UTC by adding 4h (EDT) or 5h (EST)
      const day = parseInt(dm[2]);
      // DST 2026: starts Mar 8, ends Nov 1 — months 3-10 (April-October) are always EDT,
      // March after 8th is EDT, November before 1st is EDT
      const month1 = monthNum + 1; // 1-indexed
      const isEDT = (month1 > 3 && month1 < 11) || (month1 === 3 && day >= 8) || (month1 === 11 && day < 1);
      const utcOffsetHours = isEDT ? 4 : 5;
      let utcHours = hours + utcOffsetHours;
      let utcDay = day;
      let utcMonth = monthNum;
      let utcYear = 2026;
      if (utcHours >= 24) {
        utcHours -= 24;
        // Advance day (simplified — sufficient for game schedule dates)
        const daysInMonth = new Date(utcYear, utcMonth + 1, 0).getDate();
        utcDay += 1;
        if (utcDay > daysInMonth) {
          utcDay = 1;
          utcMonth += 1;
        }
      }
      const eventDate = `${utcYear}-${String(utcMonth + 1).padStart(2, "0")}-${String(utcDay).padStart(2, "0")}T${String(utcHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+00:00`;

      const title = `Toronto Blue Jays vs ${opponent}`;
      const promoLower = promo.toLowerCase();
      const isGiveaway = GIVEAWAY_KEYWORDS.some((kw) => promoLower.includes(kw));
      const gameKey = `${eventDate}|${opponent}`;

      if (!gameMap.has(gameKey)) {
        gameMap.set(gameKey, {
          gameData: {
            title, venue: "Rogers Centre", city: "Toronto", province: "ON",
            event_date: eventDate, description: "MLB - Home Game",
            category: "sports", is_giveaway: isGiveaway,
            giveaway_item: isGiveaway ? promo : null,
            image_url: "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=600&h=400&fit=crop",
          },
          tickets: [],
        });
      } else if (isGiveaway) {
        const g = gameMap.get(gameKey)!;
        g.gameData.is_giveaway = true;
        g.gameData.giveaway_item = promo;
      }

      gameMap.get(gameKey)!.tickets.push({
        section, row_name: row, price, quantity: qty,
        quantity_sold: 0, is_active: true, is_reseller_ticket: true,
        seat_notes: promo || null,
      });
    }

    console.log(`Parsed ${gameMap.size} games`);

    // Step 1: Fetch all existing Blue Jays events in one query
    const { data: allExistingEvents } = await supabase
      .from("events")
      .select("id, title, event_date")
      .like("title", "%Toronto Blue Jays vs%")
      .eq("venue", "Rogers Centre");

    const eventLookup = new Map<string, string>();
    (allExistingEvents || []).forEach((e) => {
      eventLookup.set(`${e.title}|${e.event_date}`, e.id);
    });

    // Step 2: Identify new events to insert in batch
    const newEvents: any[] = [];
    const existingEventUpdates: { id: string; data: any }[] = [];

    for (const [, { gameData }] of gameMap) {
      const key = `${gameData.title}|${gameData.event_date}`;
      if (eventLookup.has(key)) {
        existingEventUpdates.push({
          id: eventLookup.get(key)!,
          data: { is_giveaway: gameData.is_giveaway, giveaway_item: gameData.giveaway_item },
        });
      } else {
        newEvents.push(gameData);
      }
    }

    // Batch insert new events
    if (newEvents.length > 0) {
      const { data: inserted } = await supabase
        .from("events")
        .insert(newEvents)
        .select("id, title, event_date");
      (inserted || []).forEach((e) => {
        eventLookup.set(`${e.title}|${e.event_date}`, e.id);
      });
    }

    // Update existing events (batch updates - up to 5 concurrent)
    const updateBatches = [];
    for (let i = 0; i < existingEventUpdates.length; i += 5) {
      const batch = existingEventUpdates.slice(i, i + 5);
      updateBatches.push(
        Promise.all(batch.map((u) =>
          supabase.from("events").update(u.data).eq("id", u.id)
        ))
      );
    }
    for (const batch of updateBatches) await batch;

    console.log(`Events: ${newEvents.length} new, ${existingEventUpdates.length} updated`);

    // Step 3: Fetch ALL existing non-reseller tickets for these events
    const allEventIds = [...new Set([...eventLookup.values()])];
    const existingTicketsMap = new Map<string, { id: string; quantity: number }>();

    // Fetch in batches of 50 event IDs
    for (let i = 0; i < allEventIds.length; i += 50) {
      const batch = allEventIds.slice(i, i + 50);
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, event_id, section, row_name, price, quantity")
        .in("event_id", batch)
        .eq("is_reseller_ticket", true);
      (tickets || []).forEach((t) => {
        const key = `${t.event_id}|${t.section}|${t.row_name || ""}|${t.price}`;
        existingTicketsMap.set(key, { id: t.id, quantity: t.quantity });
      });
    }

    // Step 4: Diff tickets
    const newTickets: any[] = [];
    const ticketUpdates: { id: string; quantity: number }[] = [];

    for (const [, { gameData, tickets }] of gameMap) {
      const eventKey = `${gameData.title}|${gameData.event_date}`;
      const eventId = eventLookup.get(eventKey);
      if (!eventId) continue;

      for (const t of tickets) {
        const tKey = `${eventId}|${t.section}|${t.row_name || ""}|${t.price}`;
        const existing = existingTicketsMap.get(tKey);
        if (existing) {
          if (existing.quantity !== t.quantity) {
            ticketUpdates.push({ id: existing.id, quantity: t.quantity });
          }
        } else {
          newTickets.push({ ...t, event_id: eventId });
        }
      }
    }

    // Batch insert new tickets (groups of 50)
    let ticketsInserted = 0;
    for (let i = 0; i < newTickets.length; i += 50) {
      const batch = newTickets.slice(i, i + 50);
      await supabase.from("tickets").insert(batch);
      ticketsInserted += batch.length;
    }

    // Batch update tickets (groups of 10 concurrent)
    for (let i = 0; i < ticketUpdates.length; i += 10) {
      const batch = ticketUpdates.slice(i, i + 10);
      await Promise.all(batch.map((u) =>
        supabase.from("tickets").update({ quantity: u.quantity }).eq("id", u.id)
      ));
    }

    const result = {
      success: true,
      games: gameMap.size,
      newEvents: newEvents.length,
      updatedEvents: existingEventUpdates.length,
      newTickets: ticketsInserted,
      updatedTickets: ticketUpdates.length,
    };
    console.log("Sync complete:", JSON.stringify(result));

    return new Response(JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
