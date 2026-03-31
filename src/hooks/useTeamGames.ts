import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTodayStartISO } from "@/utils/dateFilters";

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
  face_value?: number | null;
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
  const [filter, setFilter] = useState<"all" | "home" | "away">("home");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedOpponent, setSelectedOpponent] = useState("all");
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [minTickets, setMinTickets] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchTerm) return;
    setLoading(true);
    setGames([]);
    setSelectedGame(null);
    setSelectedSection(null);
    setFilter("home");
    setSelectedMonth("all");
    setSelectedOpponent("all");
    setMaxBudget(null);
    setMinTickets(null);
    setSelectedDate(null);

    const fetchGames = async () => {
      try {
        const now = new Date().toISOString();
        const { data: events } = await supabase
          .from("events")
          .select("id, title, venue, city, province, event_date, description, is_giveaway, giveaway_item")
          .like("title", `%${searchTerm}%`)
          .gte("event_date", now)
          .order("event_date", { ascending: true });

        if (!events || events.length === 0) {
          setGames([]);
          return;
        }

        const eventIds = events.map((e) => e.id);
        const pageSize = 1000;
        const allTickets: any[] = [];
        let from = 0;

        while (true) {
          const { data: pageTickets } = await (supabase
            .from("public_tickets" as any)
            .select("id, event_id, section, row_name, seat_number, price, quantity, quantity_sold, is_reseller_ticket, perks, seat_notes, hide_seat_numbers, split_type, face_value")
            .in("event_id", eventIds)
            .order("event_id", { ascending: true })
            .order("id", { ascending: true })
            .range(from, from + pageSize - 1) as any);

          if (!pageTickets || pageTickets.length === 0) break;
          allTickets.push(...pageTickets);
          if (pageTickets.length < pageSize) break;
          from += pageSize;
        }

        const ticketsByEvent: Record<string, TicketInfo[]> = {};
        allTickets.filter((t) => t.price > 0).forEach((t) => {
          if (!ticketsByEvent[t.event_id]) ticketsByEvent[t.event_id] = [];
          ticketsByEvent[t.event_id].push(t);
        });

        const currentTime = new Date().toISOString();
        const gamesWithTickets: GameEvent[] = events
          .filter((game) => game.event_date >= currentTime)
          .map((game) => {
            const tickets = (ticketsByEvent[game.id] || []).sort(
              (a, b) => (a.is_reseller_ticket ? 1 : 0) - (b.is_reseller_ticket ? 1 : 0)
            );
            return { ...game, tickets } as GameEvent;
          });

        setGames(gamesWithTickets);
        const gameParam = searchParams.get("game");
        const targetGame = gameParam
          ? gamesWithTickets.find((g) => g.id === gameParam)
          : null;
        if (targetGame) {
          setSelectedGame(targetGame);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("game");
          setSearchParams(newParams, { replace: true });
        } else if (gamesWithTickets.length > 0) {
          setSelectedGame(gamesWithTickets[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [searchTerm]);

  const resetFilters = () => {
    setFilter("home");
    setSelectedMonth("all");
    setSelectedOpponent("all");
    setMaxBudget(null);
    setMinTickets(null);
    setSelectedDate(null);
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
    minTickets,
    setMinTickets,
    selectedDate,
    setSelectedDate,
    loading,
    resetFilters,
  };
}
