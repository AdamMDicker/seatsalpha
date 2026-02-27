import { useState } from "react";
import { ZoomIn, X, Gift, Calendar, Clock, MapPin } from "lucide-react";
import rogersCentreMap from "@/assets/rogers-centre-seating.png";
import yankeeStadiumMap from "@/assets/venues/yankee-stadium-seating.jpg";
import fenwayParkMap from "@/assets/venues/fenway-park-seating.jpg";
import dodgerStadiumMap from "@/assets/venues/dodger-stadium-seating.jpg";
import wrigleyFieldMap from "@/assets/venues/wrigley-field-seating.jpg";
import truistParkMap from "@/assets/venues/truist-park-seating.jpg";
import citiFieldMap from "@/assets/venues/citi-field-seating.jpg";
import oracleParkMap from "@/assets/venues/oracle-park-seating.jpg";
import buschStadiumMap from "@/assets/venues/busch-stadium-seating.jpg";
import petcoParkMap from "@/assets/venues/petco-park-seating.jpg";

// Skydome specific section overlays
const SKYDOME_SECTIONS = [
  { id: "100L", label: "100 Level Left (Sections 107-113)", color: "hsl(353, 82%, 49%)", left: 5, top: 45, width: 18, height: 22 },
  { id: "100R", label: "100 Level Right (Sections 115-121)", color: "hsl(353, 82%, 49%)", left: 77, top: 45, width: 18, height: 22 },
  { id: "200L", label: "200 Level Left (Sections 211-221)", color: "hsl(42, 90%, 55%)", left: 8, top: 28, width: 16, height: 16 },
  { id: "200R", label: "200 Level Right (Sections 227-237)", color: "hsl(42, 90%, 55%)", left: 76, top: 28, width: 16, height: 16 },
  { id: "300L", label: "300 Level Left (Suites)", color: "hsl(220, 60%, 55%)", left: 12, top: 22, width: 14, height: 8 },
  { id: "300R", label: "300 Level Right (Suites)", color: "hsl(220, 60%, 55%)", left: 74, top: 22, width: 14, height: 8 },
  { id: "500L", label: "500 Level Left (Sections 511-521)", color: "hsl(142, 72%, 42%)", left: 4, top: 8, width: 18, height: 16 },
  { id: "500R", label: "500 Level Right (Sections 527-537)", color: "hsl(142, 72%, 42%)", left: 78, top: 8, width: 18, height: 16 },
];

// Venue-specific seating map images
const VENUE_MAPS: Record<string, string> = {
  "Skydome": rogersCentreMap,
  "Yankee Stadium": yankeeStadiumMap,
  "Fenway Park": fenwayParkMap,
  "Dodger Stadium": dodgerStadiumMap,
  "Wrigley Field": wrigleyFieldMap,
  "Truist Park": truistParkMap,
  "Citi Field": citiFieldMap,
  "Oracle Park": oracleParkMap,
  "Busch Stadium": buschStadiumMap,
  "Petco Park": petcoParkMap,
};

interface SeatingMapProps {
  availableSections: string[];
  selectedSection: string | null;
  setSelectedSection: (s: string | null) => void;
  game: {
    title: string;
    event_date: string;
    venue: string;
    city: string;
    is_giveaway?: boolean;
    giveaway_item?: string | null;
  };
  teamLogo?: string;
  teamColor?: string;
}

const SeatingMap = ({ availableSections, selectedSection, setSelectedSection, game, teamLogo, teamColor }: SeatingMapProps) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mapZoomed, setMapZoomed] = useState(false);

  const venueMap = VENUE_MAPS[game.venue];
  const isSkydome = game.venue === "Skydome";
  const sections = isSkydome ? SKYDOME_SECTIONS : [];

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-foreground mb-4">
        {game.venue} Seating Map
      </h2>
      <div className="glass rounded-xl p-4 relative">
        {venueMap ? (
          <div className="relative group">
            <img
              src={venueMap}
              alt={`${game.venue} Seating Chart`}
              className="w-full rounded-lg cursor-pointer"
              onClick={() => setMapZoomed(true)}
            />
            <button
              onClick={() => setMapZoomed(true)}
              className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2 opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="h-4 w-4 text-foreground" />
            </button>
            {sections.map((sec) => {
              const hasTickets = availableSections.includes(sec.id);
              const isSelected = selectedSection === sec.id;
              const isHovered = hoveredSection === sec.id;
              return (
                <div
                  key={sec.id}
                  className={`absolute rounded transition-all ${hasTickets ? "cursor-pointer" : ""}`}
                  style={{
                    left: `${sec.left}%`, top: `${sec.top}%`, width: `${sec.width}%`, height: `${sec.height}%`,
                    background: hasTickets
                      ? isSelected ? `${sec.color.replace(")", " / 0.5)")}` : isHovered ? `${sec.color.replace(")", " / 0.35)")}` : "transparent"
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
        ) : (
          /* Generic venue placeholder when no map image is available */
          <div
            className="relative rounded-lg overflow-hidden flex flex-col items-center justify-center py-16 px-6"
            style={{ background: teamColor ? `linear-gradient(135deg, ${teamColor}, hsl(0, 0%, 12%))` : "hsl(0, 0%, 12%)" }}
          >
            {teamLogo && (
              <img src={teamLogo} alt="" className="w-20 h-20 object-contain mb-4 opacity-30" />
            )}
            <h3 className="text-white font-display text-xl font-bold text-center">{game.venue}</h3>
            <p className="text-white/60 text-sm mt-1">{game.city}</p>
            <p className="text-white/40 text-xs mt-4 italic">Interactive seating map coming soon</p>
          </div>
        )}

        {isRogersCentre && (
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(353, 82%, 49%)" }} /> 100 Level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(42, 90%, 55%)" }} /> 200 Level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(220, 60%, 55%)" }} /> 300 Level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(142, 72%, 42%)" }} /> 500 Level</span>
            <span className="text-muted-foreground/60 italic">Click image to enlarge</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {mapZoomed && venueMap && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setMapZoomed(false)}>
          <button className="absolute top-4 right-4 bg-card/80 border border-border rounded-full p-2 hover:bg-card transition-colors z-10" onClick={() => setMapZoomed(false)}>
            <X className="h-6 w-6 text-foreground" />
          </button>
          <img src={venueMap} alt={`${game.venue} Seating Chart - Full Size`} className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Game info card */}
      <div className="glass rounded-xl p-4 mt-4 space-y-2">
        <div className="flex items-center gap-2">
          {teamLogo && <img src={teamLogo} alt="" className="w-6 h-6 object-contain" />}
          <h3 className="font-display font-semibold text-foreground">{game.title}</h3>
          {game.is_giveaway && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
              <Gift className="h-3 w-3" /> {game.giveaway_item || "Giveaway"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{formatDate(game.event_date)}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{formatTime(game.event_date)}</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{game.venue}, {game.city}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatingMap;
