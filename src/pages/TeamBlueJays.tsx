import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Tag, ChevronRight, ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import rogersCentreMap from "@/assets/rogers-centre-seating.png";
import blueJaysLogo from "@/assets/teams/blue-jays.png";

interface TicketInfo {
  id: string;
  section: string;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_reseller_ticket: boolean;
}

interface GameEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  province: string;
  event_date: string;
  description: string | null;
  tickets: TicketInfo[];
}

// Clickable hotspot zones mapped to the seating chart image (% positions)
const SECTIONS = [
  { id: "100L", label: "100 Level Left (Sections 107-113)", color: "hsl(353, 82%, 49%)", left: 5, top: 45, width: 18, height: 22 },
  { id: "100R", label: "100 Level Right (Sections 115-121)", color: "hsl(353, 82%, 49%)", left: 77, top: 45, width: 18, height: 22 },
  { id: "200L", label: "200 Level Left (Sections 211-221)", color: "hsl(42, 90%, 55%)", left: 8, top: 28, width: 16, height: 16 },
  { id: "200R", label: "200 Level Right (Sections 227-237)", color: "hsl(42, 90%, 55%)", left: 76, top: 28, width: 16, height: 16 },
  { id: "300L", label: "300 Level Left (Suites)", color: "hsl(220, 60%, 55%)", left: 12, top: 22, width: 14, height: 8 },
  { id: "300R", label: "300 Level Right (Suites)", color: "hsl(220, 60%, 55%)", left: 74, top: 22, width: 14, height: 8 },
  { id: "500L", label: "500 Level Left (Sections 511-521)", color: "hsl(142, 72%, 42%)", left: 4, top: 8, width: 18, height: 16 },
  { id: "500R", label: "500 Level Right (Sections 527-537)", color: "hsl(142, 72%, 42%)", left: 78, top: 8, width: 18, height: 16 },
];

const TeamBlueJays = () => {
  const [games, setGames] = useState<GameEvent[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "home" | "away">("all");
  const [loading, setLoading] = useState(true);
  const [mapZoomed, setMapZoomed] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, title, venue, city, province, event_date, description")
        .like("title", "%Blue Jays%")
        .order("event_date", { ascending: true });

      if (data) {
        const gamesWithTickets: GameEvent[] = [];
        for (const game of data) {
          const { data: tickets } = await supabase
            .from("tickets")
            .select("id, section, row_name, seat_number, price, quantity, quantity_sold, is_reseller_ticket")
            .eq("event_id", game.id)
            .eq("is_active", true);
          const sorted = (tickets || []).sort((a, b) => (a.is_reseller_ticket ? 1 : 0) - (b.is_reseller_ticket ? 1 : 0));
          gamesWithTickets.push({ ...game, tickets: sorted });
        }
        setGames(gamesWithTickets);
        if (gamesWithTickets.length > 0) setSelectedGame(gamesWithTickets[0]);
      }
      setLoading(false);
    };
    fetchGames();
  }, []);

  const filteredGames = games.filter((g) => {
    if (filter === "home") return g.description?.includes("Home");
    if (filter === "away") return g.description?.includes("Away");
    return true;
  });

  const availableSections = selectedGame
    ? [...new Set(selectedGame.tickets.map((t) => t.section))]
    : [];

  const sectionTickets = selectedGame && selectedSection
    ? selectedGame.tickets.filter((t) => t.section === selectedSection)
    : [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });

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
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {(["all", "home", "away"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f === "all" ? "All Games" : f === "home" ? "Home Games" : "Away Games"}
              </button>
            ))}
          </div>

          {/* Game schedule strip */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => { setSelectedGame(game); setSelectedSection(null); }}
                className={`flex-shrink-0 rounded-xl p-3 text-left transition-all min-w-[180px] border ${
                  selectedGame?.id === game.id
                    ? "bg-primary/15 border-primary shadow-lg shadow-primary/10"
                    : "glass hover:border-primary/30"
                }`}
              >
                <p className="text-xs font-semibold text-primary">{formatDate(game.event_date)}</p>
                <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">{game.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{game.venue}</p>
                {game.tickets.length > 0 && (
                  <p className="text-xs text-success mt-1 font-medium">
                    From ${Math.min(...game.tickets.map((t) => t.price))}
                  </p>
                )}
              </button>
            ))}
          </div>

          {selectedGame && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Stadium map */}
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                  Rogers Centre Seating Map
                </h2>
                <div className="glass rounded-xl p-4 relative">
                  <div className="relative group">
                    <img
                      src={rogersCentreMap}
                      alt="Rogers Centre Seating Chart"
                      className="w-full rounded-lg cursor-pointer"
                      onClick={() => setMapZoomed(true)}
                    />
                    {/* Zoom hint */}
                    <button
                      onClick={() => setMapZoomed(true)}
                      className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2 opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      <ZoomIn className="h-4 w-4 text-foreground" />
                    </button>
                    {/* Clickable overlay hotspots */}
                    {SECTIONS.map((sec) => {
                      const hasTickets = availableSections.includes(sec.id);
                      const isSelected = selectedSection === sec.id;
                      const isHovered = hoveredSection === sec.id;
                      return (
                        <div
                          key={sec.id}
                          className={`absolute rounded transition-all ${hasTickets ? "cursor-pointer" : ""}`}
                          style={{
                            left: `${sec.left}%`,
                            top: `${sec.top}%`,
                            width: `${sec.width}%`,
                            height: `${sec.height}%`,
                            background: hasTickets
                              ? isSelected
                                ? `${sec.color.replace(")", " / 0.5)")}`
                                : isHovered
                                  ? `${sec.color.replace(")", " / 0.35)")}`
                                  : "transparent"
                              : "hsla(0, 0%, 0%, 0.4)",
                            border: isSelected ? "2px solid white" : hasTickets && isHovered ? `2px solid ${sec.color}` : "2px solid transparent",
                          }}
                          onMouseEnter={() => hasTickets && setHoveredSection(sec.id)}
                          onMouseLeave={() => setHoveredSection(null)}
                          onClick={() => hasTickets && setSelectedSection(sec.id)}
                          title={hasTickets ? `${sec.label} - Click to view tickets` : `${sec.label} - No tickets available`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(353, 82%, 49%)" }} /> 100 Level</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(42, 90%, 55%)" }} /> 200 Level</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(220, 60%, 55%)" }} /> 300 Level</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(142, 72%, 42%)" }} /> 500 Level</span>
                    <span className="text-muted-foreground/60 italic">Click image to enlarge</span>
                  </div>
                </div>

                {/* Fullscreen lightbox */}
                {mapZoomed && (
                  <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setMapZoomed(false)}
                  >
                    <button
                      className="absolute top-4 right-4 bg-card/80 border border-border rounded-full p-2 hover:bg-card transition-colors z-10"
                      onClick={() => setMapZoomed(false)}
                    >
                      <X className="h-6 w-6 text-foreground" />
                    </button>
                    <img
                      src={rogersCentreMap}
                      alt="Rogers Centre Seating Chart - Full Size"
                      className="max-w-full max-h-[90vh] object-contain rounded-xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* Game info */}
                <div className="glass rounded-xl p-4 mt-4 space-y-2">
                  <h3 className="font-display font-semibold text-foreground">{selectedGame.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{formatDate(selectedGame.event_date)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{formatTime(selectedGame.event_date)}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{selectedGame.venue}, {selectedGame.city}</span>
                  </div>
                </div>
              </div>

              {/* Right: Ticket listings */}
              <div>
                {(() => {
                  const allTickets = selectedSection
                    ? selectedGame.tickets.filter((t) => t.section === selectedSection)
                    : selectedGame.tickets;
                  const featuredTickets = allTickets.filter((t) => !t.is_reseller_ticket).slice(0, 4);
                  const resellerTickets = allTickets.filter((t) => t.is_reseller_ticket).slice(0, 3);

                  const renderTicket = (ticket: TicketInfo) => (
                    <div key={ticket.id} className={`glass rounded-xl p-4 flex items-center justify-between hover:border-primary/40 transition-all ${!ticket.is_reseller_ticket ? 'border-primary/20' : ''}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">Section {ticket.section}</p>
                          {!ticket.is_reseller_ticket && (
                            <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-semibold">No Fees</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ticket.row_name && `Row ${ticket.row_name}`}
                          {ticket.seat_number && ` · Seats ${ticket.seat_number}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ticket.quantity - ticket.quantity_sold} available
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-display text-xl font-bold text-foreground">${ticket.price}</p>
                          <p className="text-xs text-muted-foreground">per ticket</p>
                        </div>
                        <Button variant="hero" size="sm">Buy</Button>
                      </div>
                    </div>
                  );

                  return (
                    <div>
                      {selectedSection && (
                        <button
                          onClick={() => setSelectedSection(null)}
                          className="text-sm text-primary hover:underline mb-4 flex items-center gap-1"
                        >
                          ← All Sections
                        </button>
                      )}

                      {/* Featured Tickets */}
                      <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        ⭐ Featured Tickets
                      </h2>
                      {featuredTickets.length > 0 ? (
                        <div className="space-y-3 mb-8">
                          {featuredTickets.map(renderTicket)}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm mb-8">No featured tickets for this selection.</p>
                      )}

                      {/* Reseller Tickets */}
                      <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                        Tickets
                      </h2>
                      {resellerTickets.length > 0 ? (
                        <div className="space-y-3">
                          {resellerTickets.map(renderTicket)}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No reseller tickets for this selection.</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamBlueJays;
