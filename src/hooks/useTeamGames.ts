import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TicketInfo {
  id: string;
  section: string;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_reseller_ticket: boolean;
  perks: string[] | null;
  seat_notes: string | null;
  hide_seat_numbers?: boolean;
  split_type?: string | null;
}

export interface GameEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  province: string;
  event_date: string;
  description: string | null;
  is_giveaway: boolean;
  giveaway_item: string | null;
  tickets: TicketInfo[];
}

export function useTeamGames(searchTerm: string | undefined) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState<GameEvent[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "home" | "away">("all");
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [selectedOpponent, setSelectedOpponent] = useState("all");
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchTerm) return;
    setLoading(true);
    setGames([]);
    setSelectedGame(null);
    setSelectedSection(null);
    setFilter("all");
    setSelectedMonth(currentMonthKey);
    setSelectedOpponent("all");
    setMaxBudget(null);

    const fetchGames = async () => {
      // Step 1: Fetch all events in a single query
      const { data: events } = await supabase
        .from("events")
        .select("id, title, venue, city, province, event_date, description, is_giveaway, giveaway_item")
        .like("title", `%${searchTerm}%`)
        .order("event_date", { ascending: true });

      if (!events || events.length === 0) {
        setGames([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch ALL tickets for these events in a single batch query
      const eventIds = events.map((e) => e.id);
      const { data: allTickets } = await supabase
        .from("tickets")
        .select("id, event_id, section, row_name, seat_number, price, quantity, quantity_sold, is_reseller_ticket, perks, seat_notes, hide_seat_numbers")
        .in("event_id", eventIds)
        .eq("is_active", true);

      // Step 3: Group tickets by event_id client-side
      const ticketsByEvent: Record<string, TicketInfo[]> = {};
      (allTickets || []).forEach((t) => {
        if (!ticketsByEvent[t.event_id]) ticketsByEvent[t.event_id] = [];
        ticketsByEvent[t.event_id].push(t);
      });

      // Step 4: Merge and sort
      const gamesWithTickets: GameEvent[] = events.map((game) => {
        const tickets = (ticketsByEvent[game.id] || []).sort(
          (a, b) => (a.is_reseller_ticket ? 1 : 0) - (b.is_reseller_ticket ? 1 : 0)
        );
        return { ...game, tickets } as GameEvent;
      });

      setGames(gamesWithTickets);
      // Auto-select game from ?game= query param, or default to first
      const gameParam = searchParams.get("game");
      const targetGame = gameParam
        ? gamesWithTickets.find((g) => g.id === gameParam)
        : null;
      if (targetGame) {
        setSelectedGame(targetGame);
        // Clear the query param after selecting
        setSearchParams({}, { replace: true });
      } else if (gamesWithTickets.length > 0) {
        setSelectedGame(gamesWithTickets[0]);
      }
      setLoading(false);
    };

    fetchGames();
  }, [searchTerm]);

  const resetFilters = () => {
    setFilter("all");
    setSelectedMonth(currentMonthKey);
    setSelectedOpponent("all");
    setMaxBudget(null);
  };

  return {
    games,
    selectedGame,
    setSelectedGame,
    selectedSection,
    setSelectedSection,
    filter,
    setFilter,
    selectedMonth,
    setSelectedMonth,
    selectedOpponent,
    setSelectedOpponent,
    maxBudget,
    setMaxBudget,
    loading,
    resetFilters,
  };
}
