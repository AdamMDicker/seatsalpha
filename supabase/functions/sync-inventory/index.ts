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

const GIVEAWAY_KEYWORDS = [
  "bobblehead", "jersey", "hat", "cap", "shirt", "t-shirt", "tee", "towel",
  "blanket", "poster", "figurine", "statue", "replica", "magnet", "pennant",
  "flag", "bag", "backpack", "lunchbox", "giveaway", "crewneck", "hoodie",
  "toque", "scarf",
];

function parseSeatTrim(seatTrim: string): { section: string; row: string | null } {
  // Format: "133, row 3," or "22, row 1" or "4, row 2,"
  const match = seatTrim.match(/^(\d+)\s*,?\s*(?:row\s*(\d+))?/i);
  if (match) {
    return { section: match[1], row: match[2] || null };
  }
  return { section: seatTrim.replace(/,/g, "").trim(), row: null };
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return { hours: 19, minutes: 7 };
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

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
    if (!csvRes.ok) throw new Error(`Failed to fetch CSV: ${csvRes.status}`);
    const csvText = await csvRes.text();
    const lines = csvText.split("\n").filter((l) => l.trim().length > 0);

    // Find header row (contains "Date" and "Opponent")
    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const lower = lines[i].toLowerCase();
      if (lower.includes("date") && lower.includes("opponent")) {
        headerIdx = i;
        break;
      }
    }
    if (headerIdx === -1) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not find header row" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = parseCSVLine(lines[headerIdx]).map((h) => h.toLowerCase().trim());
    console.log("Headers:", headers);

    // Map columns - specific to this sheet format
    // Columns: "all tickets date" | "day" | "time" | "opponent" | "promo" | "seat trim" | "seats per row" | "total price" | "price per seat"
    const dateIdx = headers.findIndex((h) => h.includes("date"));
    const timeIdx = headers.findIndex((h) => h.includes("time"));
    const opponentIdx = headers.findIndex((h) => h.includes("opponent"));
    const promoIdx = headers.findIndex((h) => h.includes("promo"));
    const seatTrimIdx = headers.findIndex((h) => h.includes("seat trim") || h.includes("seat"));
    const seatsPerRowIdx = headers.findIndex((h) => h.includes("seats per row") || h.includes("seats"));
    const pricePerSeatIdx = headers.findIndex((h) => h.includes("price per seat") || h.includes("per seat"));
    const totalPriceIdx = headers.findIndex((h) => h.includes("total price"));

    console.log(`Columns: date=${dateIdx}, time=${timeIdx}, opponent=${opponentIdx}, promo=${promoIdx}, seatTrim=${seatTrimIdx}, qty=${seatsPerRowIdx}, pricePerSeat=${pricePerSeatIdx}`);

    // Parse data rows
    const currentYear = new Date().getFullYear();
    const gameMap = new Map<string, { gameData: any; tickets: any[] }>();

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);

      const dateStr = dateIdx >= 0 ? cols[dateIdx]?.trim() : "";
      const timeStr = timeIdx >= 0 ? cols[timeIdx]?.trim() : "";
      const opponent = opponentIdx >= 0 ? cols[opponentIdx]?.trim() : "";
      const promo = promoIdx >= 0 ? cols[promoIdx]?.trim() : "";
      const seatTrim = seatTrimIdx >= 0 ? cols[seatTrimIdx]?.trim() : "";
      const seatsPerRow = seatsPerRowIdx >= 0 ? cols[seatsPerRowIdx]?.trim() : "2";
      const pricePerSeatStr = pricePerSeatIdx >= 0 ? cols[pricePerSeatIdx]?.trim() : "";

      // Skip empty/header rows
      if (!dateStr || !opponent || !seatTrim) continue;
      if (dateStr.toLowerCase().includes("date")) continue;

      // Parse price per seat
      const price = parseFloat(pricePerSeatStr.replace(/[$,]/g, ""));
      if (isNaN(price) || price <= 0) continue;

      // Skip SWAP
      if (opponent.toUpperCase().includes("SWAP") || promo.toUpperCase().includes("SWAP")) continue;

      // Parse quantity
      const qty = parseInt(seatsPerRow) || 2;

      // Parse section/row from seat trim
      const { section, row } = parseSeatTrim(seatTrim);
      if (!section) continue;

      // Parse date: "March 27", "April 3", etc
      let eventDate: string;
      try {
        const { hours, minutes } = parseTime(timeStr);
        // Handle "Month Day" format
        const dateMatch = dateStr.match(/^(\w+)\s+(\d+)/);
        if (!dateMatch) {
          console.log(`Skipping row ${i}: can't parse date "${dateStr}"`);
          continue;
        }
        const monthName = dateMatch[1];
        const day = parseInt(dateMatch[2]);

        const monthMap: Record<string, number> = {
          january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
        };
        const monthNum = monthMap[monthName.toLowerCase()];
        if (monthNum === undefined) {
          console.log(`Skipping row ${i}: unknown month "${monthName}"`);
          continue;
        }

        // Use 2026 for MLB season
        const year = 2026;
        const d = new Date(year, monthNum, day, hours, minutes);
        eventDate = d.toISOString();
      } catch {
        console.log(`Skipping row ${i}: date parse error`);
        continue;
      }

      // All games in this sheet are home games at Skydome
      const title = `Toronto Blue Jays vs ${opponent}`;
      const description = "MLB - Home Game";

      // Detect giveaway
      const promoLower = promo.toLowerCase();
      const isGiveaway = GIVEAWAY_KEYWORDS.some((kw) => promoLower.includes(kw));

      const gameKey = `${eventDate}|${opponent}`;

      if (!gameMap.has(gameKey)) {
        gameMap.set(gameKey, {
          gameData: {
            title,
            venue: "Skydome",
            city: "Toronto",
            province: "ON",
            event_date: eventDate,
            description,
            category: "sports",
            is_giveaway: isGiveaway,
            giveaway_item: isGiveaway ? promo : null,
            image_url: "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=600&h=400&fit=crop",
          },
          tickets: [],
        });
      } else if (isGiveaway) {
        const existing = gameMap.get(gameKey)!;
        existing.gameData.is_giveaway = true;
        existing.gameData.giveaway_item = promo;
      }

      gameMap.get(gameKey)!.tickets.push({
        section,
        row_name: row,
        seat_number: null,
        price,
        quantity: qty,
        quantity_sold: 0,
        is_active: true,
        is_reseller_ticket: false,
        seat_notes: promo || null,
      });
    }

    console.log(`Parsed ${gameMap.size} games from CSV`);

    let eventsUpserted = 0;
    let ticketsUpserted = 0;
    let ticketsUpdated = 0;

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
        await supabase
          .from("events")
          .update({
            is_giveaway: gameData.is_giveaway,
            giveaway_item: gameData.giveaway_item,
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

      // Sync tickets
      for (const ticket of tickets) {
        const matchQuery = supabase
          .from("tickets")
          .select("id, quantity, quantity_sold")
          .eq("event_id", eventId)
          .eq("section", ticket.section)
          .eq("price", ticket.price)
          .eq("is_reseller_ticket", false);

        if (ticket.row_name) {
          matchQuery.eq("row_name", ticket.row_name);
        }

        const { data: existingTickets } = await matchQuery.limit(1);

        if (existingTickets && existingTickets.length > 0) {
          // Update quantity (in case sheet changed)
          const existing = existingTickets[0];
          if (existing.quantity !== ticket.quantity) {
            await supabase
              .from("tickets")
              .update({ quantity: ticket.quantity })
              .eq("id", existing.id);
            ticketsUpdated++;
          }
        } else {
          await supabase.from("tickets").insert({
            event_id: eventId,
            section: ticket.section,
            row_name: ticket.row_name,
            seat_number: ticket.seat_number,
            price: ticket.price,
            quantity: ticket.quantity,
            quantity_sold: ticket.quantity_sold,
            is_active: ticket.is_active,
            is_reseller_ticket: false,
            seat_notes: ticket.seat_notes,
          });
          ticketsUpserted++;
        }
      }
    }

    console.log(`Sync complete: ${eventsUpserted} events, ${ticketsUpserted} new tickets, ${ticketsUpdated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        events: eventsUpserted,
        newTickets: ticketsUpserted,
        updatedTickets: ticketsUpdated,
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
