import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

// Giveaway detection keywords
const GIVEAWAY_KEYWORDS = [
  "bobblehead",
  "jersey",
  "hat",
  "cap",
  "shirt",
  "t-shirt",
  "tee",
  "towel",
  "blanket",
  "poster",
  "figurine",
  "statue",
  "replica",
  "magnet",
  "pennant",
  "flag",
  "bag",
  "backpack",
  "lunchbox",
  "giveaway",
  "crewneck",
  "hoodie",
  "toque",
  "scarf",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log("Fetching Google Sheet CSV...");
    const csvRes = await fetch(SHEET_CSV_URL);
    if (!csvRes.ok) {
      throw new Error(`Failed to fetch CSV: ${csvRes.status}`);
    }
    const csvText = await csvRes.text();
    const lines = csvText.split("\n").filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ success: true, message: "No data rows found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
    console.log("CSV Headers:", headers);

    // Find column indices
    const dateIdx = headers.findIndex((h) => h.includes("date"));
    const timeIdx = headers.findIndex((h) => h.includes("time"));
    const opponentIdx = headers.findIndex((h) => h.includes("opponent") || h.includes("vs"));
    const venueIdx = headers.findIndex((h) => h.includes("venue") || h.includes("stadium"));
    const cityIdx = headers.findIndex((h) => h.includes("city"));
    const provinceIdx = headers.findIndex((h) => h.includes("province") || h.includes("state"));
    const sectionIdx = headers.findIndex((h) => h.includes("section"));
    const rowIdx = headers.findIndex((h) => h.includes("row"));
    const seatIdx = headers.findIndex((h) => h.includes("seat"));
    const priceIdx = headers.findIndex((h) => h.includes("price"));
    const qtyIdx = headers.findIndex((h) => h.includes("qty") || h.includes("quantity"));
    const soldIdx = headers.findIndex((h) => h.includes("sold"));
    const promoIdx = headers.findIndex((h) => h.includes("promo") || h.includes("giveaway") || h.includes("promotion"));
    const homeAwayIdx = headers.findIndex((h) => h.includes("home") || h.includes("h/a") || h.includes("location"));
    const notesIdx = headers.findIndex((h) => h.includes("note"));
    const activeIdx = headers.findIndex((h) => h.includes("active") || h.includes("status"));

    console.log(`Found columns: date=${dateIdx}, time=${timeIdx}, opponent=${opponentIdx}, section=${sectionIdx}, price=${priceIdx}, qty=${qtyIdx}, sold=${soldIdx}, promo=${promoIdx}`);

    // Group rows by game (date+opponent+venue)
    const gameMap = new Map<string, { gameData: any; tickets: any[] }>();

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 3) continue;

      const dateStr = dateIdx >= 0 ? cols[dateIdx] : "";
      const timeStr = timeIdx >= 0 ? cols[timeIdx] : "";
      const opponent = opponentIdx >= 0 ? cols[opponentIdx] : "";
      const venue = venueIdx >= 0 ? cols[venueIdx] : "Skydome";
      const city = cityIdx >= 0 ? cols[cityIdx] : "Toronto";
      const province = provinceIdx >= 0 ? cols[provinceIdx] : "ON";
      const section = sectionIdx >= 0 ? cols[sectionIdx] : "";
      const row = rowIdx >= 0 ? cols[rowIdx] : null;
      const seat = seatIdx >= 0 ? cols[seatIdx] : null;
      const priceRaw = priceIdx >= 0 ? cols[priceIdx] : "0";
      const qtyRaw = qtyIdx >= 0 ? cols[qtyIdx] : "1";
      const soldRaw = soldIdx >= 0 ? cols[soldIdx] : "0";
      const promo = promoIdx >= 0 ? cols[promoIdx] : "";
      const homeAway = homeAwayIdx >= 0 ? cols[homeAwayIdx]?.toLowerCase() : "";
      const notes = notesIdx >= 0 ? cols[notesIdx] : "";
      const activeRaw = activeIdx >= 0 ? cols[activeIdx]?.toLowerCase() : "";

      // Skip invalid rows
      if (!dateStr || !opponent || !section) continue;

      // Parse price
      const price = parseFloat(priceRaw.replace(/[$,]/g, ""));
      if (isNaN(price) || price <= 0) continue;

      // Skip SWAP entries
      if (notes?.toUpperCase().includes("SWAP") || opponent?.toUpperCase().includes("SWAP")) continue;

      const qty = parseInt(qtyRaw) || 1;
      const sold = parseInt(soldRaw) || 0;

      // Check if inactive
      const isActive = activeRaw !== "inactive" && activeRaw !== "false" && activeRaw !== "no";

      // Parse date
      let eventDate: string;
      try {
        const dateParts = dateStr.split(/[/-]/);
        let year: number, month: number, day: number;
        if (dateParts[0].length === 4) {
          year = parseInt(dateParts[0]);
          month = parseInt(dateParts[1]);
          day = parseInt(dateParts[2]);
        } else {
          month = parseInt(dateParts[0]);
          day = parseInt(dateParts[1]);
          year = parseInt(dateParts[2]);
          if (year < 100) year += 2000;
        }

        let hours = 19, minutes = 7;
        if (timeStr) {
          const timeParts = timeStr.match(/(\d+):(\d+)\s*(am|pm)?/i);
          if (timeParts) {
            hours = parseInt(timeParts[1]);
            minutes = parseInt(timeParts[2]);
            if (timeParts[3]?.toLowerCase() === "pm" && hours !== 12) hours += 12;
            if (timeParts[3]?.toLowerCase() === "am" && hours === 12) hours = 0;
          }
        }

        const d = new Date(year, month - 1, day, hours, minutes);
        eventDate = d.toISOString();
      } catch {
        console.log(`Skipping row ${i}: invalid date "${dateStr}"`);
        continue;
      }

      // Determine home/away
      const isHome = homeAway.includes("home") || homeAway === "h" ||
        (!homeAway && (venue.toLowerCase().includes("skydome") || venue.toLowerCase().includes("rogers")));
      const isAway = homeAway.includes("away") || homeAway === "a" ||
        (!homeAway && !isHome);

      // Build game title
      const title = isAway
        ? `Toronto Blue Jays @ ${opponent}`
        : `Toronto Blue Jays vs ${opponent}`;

      const description = isAway ? "MLB - Away Game" : "MLB - Home Game";

      // Detect giveaway
      const promoLower = promo.toLowerCase();
      const isGiveaway = GIVEAWAY_KEYWORDS.some((kw) => promoLower.includes(kw));

      const gameKey = `${eventDate}|${opponent}|${venue}`;

      if (!gameMap.has(gameKey)) {
        gameMap.set(gameKey, {
          gameData: {
            title,
            venue: isHome ? "Skydome" : venue,
            city: isHome ? "Toronto" : city,
            province: isHome ? "ON" : province,
            event_date: eventDate,
            description,
            category: "sports",
            is_giveaway: isGiveaway,
            giveaway_item: isGiveaway ? promo : null,
            image_url:
              "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=600&h=400&fit=crop",
          },
          tickets: [],
        });
      } else if (isGiveaway) {
        // Update giveaway info if this row has it
        const existing = gameMap.get(gameKey)!;
        existing.gameData.is_giveaway = true;
        existing.gameData.giveaway_item = promo;
      }

      gameMap.get(gameKey)!.tickets.push({
        section,
        row_name: row || null,
        seat_number: seat || null,
        price,
        quantity: qty,
        quantity_sold: sold,
        is_active: isActive,
        is_reseller_ticket: false,
        seat_notes: notes || null,
      });
    }

    console.log(`Parsed ${gameMap.size} games from CSV`);

    let eventsUpserted = 0;
    let ticketsUpserted = 0;

    for (const [, { gameData, tickets }] of gameMap) {
      // Find or create event
      const { data: existingEvents } = await supabase
        .from("events")
        .select("id")
        .eq("title", gameData.title)
        .eq("event_date", gameData.event_date)
        .limit(1);

      let eventId: string;

      if (existingEvents && existingEvents.length > 0) {
        eventId = existingEvents[0].id;
        // Update event metadata (giveaway status may change)
        await supabase
          .from("events")
          .update({
            is_giveaway: gameData.is_giveaway,
            giveaway_item: gameData.giveaway_item,
            venue: gameData.venue,
          })
          .eq("id", eventId);
      } else {
        const { data: newEvent, error } = await supabase
          .from("events")
          .insert(gameData)
          .select("id")
          .single();
        if (error || !newEvent) {
          console.error(`Failed to create event: ${gameData.title}`, error);
          continue;
        }
        eventId = newEvent.id;
      }
      eventsUpserted++;

      // Sync tickets: match by event_id + section + row + price
      for (const ticket of tickets) {
        const matchQuery = supabase
          .from("tickets")
          .select("id, quantity_sold")
          .eq("event_id", eventId)
          .eq("section", ticket.section)
          .eq("price", ticket.price);

        if (ticket.row_name) {
          matchQuery.eq("row_name", ticket.row_name);
        }

        const { data: existingTickets } = await matchQuery.limit(1);

        if (existingTickets && existingTickets.length > 0) {
          // Update existing ticket
          await supabase
            .from("tickets")
            .update({
              quantity: ticket.quantity,
              quantity_sold: ticket.quantity_sold,
              is_active: ticket.is_active,
              seat_number: ticket.seat_number,
              seat_notes: ticket.seat_notes,
            })
            .eq("id", existingTickets[0].id);
        } else {
          // Insert new ticket
          await supabase.from("tickets").insert({
            event_id: eventId,
            section: ticket.section,
            row_name: ticket.row_name,
            seat_number: ticket.seat_number,
            price: ticket.price,
            quantity: ticket.quantity,
            quantity_sold: ticket.quantity_sold,
            is_active: ticket.is_active,
            is_reseller_ticket: ticket.is_reseller_ticket,
            seat_notes: ticket.seat_notes,
          });
        }
        ticketsUpserted++;
      }
    }

    console.log(`Sync complete: ${eventsUpserted} events, ${ticketsUpserted} tickets`);

    return new Response(
      JSON.stringify({
        success: true,
        events: eventsUpserted,
        tickets: ticketsUpserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
