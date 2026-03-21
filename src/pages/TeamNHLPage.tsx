import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GameScheduleFilters from "@/components/team/GameScheduleFilters";
import GameCard from "@/components/team/GameCard";
import SeatingMap from "@/components/team/SeatingMap";
import TicketListings from "@/components/team/TicketListings";
import { getNHLTeamBySlug } from "@/data/nhlTeams";
import { getNHLLogo } from "@/data/nhlLogos";
import { useTeamGames } from "@/hooks/useTeamGames";

const TeamNHLPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const team = slug ? getNHLTeamBySlug(slug) : undefined;
  const teamLogo = slug ? getNHLLogo(slug) : undefined;

  const {
    games, selectedGame, setSelectedGame,
    selectedSection, setSelectedSection,
    filter, setFilter,
    selectedMonth, setSelectedMonth,
    selectedOpponent, setSelectedOpponent,
    maxBudget, setMaxBudget,
    minTickets, setMinTickets,
    selectedDate, setSelectedDate,
    loading, resetFilters,
  } = useTeamGames(team?.searchTerm);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (filter === "home" && !g.description?.includes("Home")) return false;
      if (filter === "away" && !g.description?.includes("Away")) return false;
      if (selectedMonth !== "all") {
        const d = new Date(g.event_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== selectedMonth) return false;
      }
      if (selectedOpponent !== "all") {
        if (!g.title.toLowerCase().includes(selectedOpponent.toLowerCase())) return false;
      }
      if (maxBudget !== null) {
        const cheapest = g.tickets.length > 0 ? Math.min(...g.tickets.map((t) => t.price)) : Infinity;
        if (cheapest > maxBudget) return false;
      }
      if (minTickets !== null) {
        const hasEnough = g.tickets.some((t) => (t.quantity - t.quantity_sold) >= minTickets);
        if (!hasEnough) return false;
      }
      if (selectedDate) {
        const gDate = new Date(g.event_date).toDateString();
        if (gDate !== selectedDate.toDateString()) return false;
      }
      return true;
    });
  }, [games, filter, selectedMonth, selectedOpponent, maxBudget, minTickets, selectedDate]);

  const availableSections = selectedGame
    ? [...new Set(selectedGame.tickets.map((t) => t.section))]
    : [];

  if (!team) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Loading {team.name} schedule...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="py-8 border-b border-border" style={{ background: team.primaryColor }}>
          <div className="container mx-auto px-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center p-1.5">
              {teamLogo ? (
                <img src={teamLogo} alt={team.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-bold text-white">{team.shortName.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{team.name}</h1>
              <p className="text-sm text-white/70">{team.venue} · {team.city}, {team.province} · {team.season}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
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
            minTickets={minTickets}
            setMinTickets={setMinTickets}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          {filteredGames.length > 0 ? (
            <div className="flex flex-col gap-2 md:flex-row md:gap-3 md:overflow-x-auto pb-4 mb-8 scrollbar-hide">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isSelected={selectedGame?.id === game.id}
                  onClick={() => { setSelectedGame(game); setSelectedSection(null); }}
                  teamLogo={teamLogo}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center mb-8">
              <p className="text-muted-foreground">
                {games.length === 0
                  ? `No ${team.name} events found yet. Check back soon!`
                  : "No games match your filters."}
              </p>
              {games.length > 0 && (
                <button onClick={resetFilters} className="text-primary text-sm mt-2 hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {selectedGame && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SeatingMap
                availableSections={availableSections}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                game={selectedGame}
                teamLogo={teamLogo}
                teamColor={team.primaryColor}
              />
              <TicketListings
                tickets={selectedGame.tickets}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                isGiveaway={selectedGame.is_giveaway}
                giveawayItem={selectedGame.giveaway_item}
                gameTitle={selectedGame.title}
                gameId={selectedGame.id}
                venueName={selectedGame.venue}
                eventDate={selectedGame.event_date}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamNHLPage;
