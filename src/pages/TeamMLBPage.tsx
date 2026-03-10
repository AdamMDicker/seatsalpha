import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlueJaysNews from "@/components/BlueJaysNews";
import GameScheduleFilters from "@/components/team/GameScheduleFilters";
import GameCard from "@/components/team/GameCard";
import SeatingMap from "@/components/team/SeatingMap";
import TicketListings from "@/components/team/TicketListings";
import { getMLBTeamBySlug } from "@/data/mlbTeams";
import { getMLBLogo } from "@/data/mlbLogos";
import { useTeamGames } from "@/hooks/useTeamGames";

const TeamMLBPage = () => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = routeSlug || (window.location.pathname.includes("blue-jays") ? "blue-jays" : undefined);
  const team = slug ? getMLBTeamBySlug(slug) : undefined;
  const teamLogo = slug ? getMLBLogo(slug) : undefined;

  const {
    games, selectedGame, setSelectedGame,
    selectedSection, setSelectedSection,
    filter, setFilter,
    selectedMonth, setSelectedMonth,
    selectedOpponent, setSelectedOpponent,
    maxBudget, setMaxBudget,
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
      return true;
    });
  }, [games, filter, selectedMonth, selectedOpponent, maxBudget]);

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
        {/* Hero banner */}
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
          />

          {filteredGames.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
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
                <button
                  onClick={() => { setFilter("all"); setSelectedMonth("all"); setSelectedOpponent("all"); setMaxBudget(null); }}
                  className="text-primary text-sm mt-2 hover:underline"
                >
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
                venueName={selectedGame.venue}
              />
            </div>
          )}

          {/* Only show news for Blue Jays for now */}
          {slug === "blue-jays" && <BlueJaysNews />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamMLBPage;
