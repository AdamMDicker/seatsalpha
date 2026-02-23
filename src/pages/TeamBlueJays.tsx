import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import blueJaysLogo from "@/assets/teams/blue-jays.png";
import BlueJaysNews from "@/components/BlueJaysNews";
import GameScheduleFilters from "@/components/team/GameScheduleFilters";
import GameCard from "@/components/team/GameCard";
import SeatingMap from "@/components/team/SeatingMap";
import TicketListings from "@/components/team/TicketListings";

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
}

interface GameEvent {
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

const TeamBlueJays = () => {
  const [games, setGames] = useState<GameEvent[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "home" | "away">("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedOpponent, setSelectedOpponent] = useState("all");
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, venue, city, province, event_date, description, is_giveaway, giveaway_item")
        .like("title", "%Blue Jays%")
        .order("event_date", { ascending: true });

      if (data) {
        const gamesWithTickets: GameEvent[] = [];
        for (const game of data) {
          const { data: tickets } = await supabase
            .from("tickets")
            .select("id, section, row_name, seat_number, price, quantity, quantity_sold, is_reseller_ticket, perks, seat_notes")
            .eq("event_id", game.id)
            .eq("is_active", true);
          const sorted = (tickets || []).sort((a, b) => (a.is_reseller_ticket ? 1 : 0) - (b.is_reseller_ticket ? 1 : 0));
          gamesWithTickets.push({ ...game, tickets: sorted } as GameEvent);
        }
        setGames(gamesWithTickets);
        if (gamesWithTickets.length > 0) setSelectedGame(gamesWithTickets[0]);
      }
      setLoading(false);
    };
    fetchGames();
  }, []);

  // Apply all filters
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      // Home/Away
      if (filter === "home" && !g.description?.includes("Home")) return false;
      if (filter === "away" && !g.description?.includes("Away")) return false;

      // Month
      if (selectedMonth !== "all") {
        const d = new Date(g.event_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== selectedMonth) return false;
      }

      // Opponent
      if (selectedOpponent !== "all") {
        if (!g.title.toLowerCase().includes(selectedOpponent.toLowerCase())) return false;
      }

      // Budget — at least one ticket under budget
      if (maxBudget !== null) {
        const cheapest = g.tickets.length > 0 ? Math.min(...g.tickets.map((t) => t.price)) : Infinity;
        if (cheapest > maxBudget) return false;
      }

      return true;
    });
  }, [games, filter, selectedMonth, selectedOpponent, maxBudget]);

  const availableSections = selectedGame
    ? [...new Set(selectedGame.tickets.map((t) => t.section))]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Loading Blue Jays schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero banner */}
        <div className="bg-[hsl(220,60%,20%)] py-8 border-b border-border">
          <div className="container mx-auto px-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center p-1.5">
              <img src={blueJaysLogo} alt="Toronto Blue Jays" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Toronto Blue Jays</h1>
              <p className="text-sm text-blue-200">Rogers Centre · Toronto, ON · 2026 MLB Season</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filters */}
          <GameScheduleFilters
            games={games}
            filter={filter}
            setFilter={setFilter}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedOpponent={selectedOpponent}
            setSelectedOpponent={setSelectedOpponent}
            maxBudget={maxBudget}
            setMaxBudget={setMaxBudget}
          />

          {/* Game schedule strip */}
          {filteredGames.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={selectedGame?.id === game.id}
                  onClick={() => { setSelectedGame(game); setSelectedSection(null); }}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center mb-8">
              <p className="text-muted-foreground">No games match your filters.</p>
              <button
                onClick={() => { setFilter("all"); setSelectedMonth("all"); setSelectedOpponent("all"); setMaxBudget(null); }}
                className="text-primary text-sm mt-2 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {selectedGame && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SeatingMap
                availableSections={availableSections}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                game={selectedGame}
              />
              <TicketListings
                tickets={selectedGame.tickets}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                isGiveaway={selectedGame.is_giveaway}
                giveawayItem={selectedGame.giveaway_item}
              />
            </div>
          )}

          <BlueJaysNews />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamBlueJays;
