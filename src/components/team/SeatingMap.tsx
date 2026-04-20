import { useState } from "react";
import { ZoomIn, X, Gift, Calendar, Clock, MapPin, ChevronDown, Map as MapIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import rogersCentreMap from "@/assets/venues/rogers-centre-seating-map-v2.png";
import yankeeStadiumMap from "@/assets/venues/yankee-stadium-seating.jpg";
import fenwayParkMap from "@/assets/venues/fenway-park-seating.jpg";
import dodgerStadiumMap from "@/assets/venues/dodger-stadium-seating.jpg";
import wrigleyFieldMap from "@/assets/venues/wrigley-field-seating.jpg";
import truistParkMap from "@/assets/venues/truist-park-seating.jpg";
import citiFieldMap from "@/assets/venues/citi-field-seating.jpg";
import oracleParkMap from "@/assets/venues/oracle-park-seating.jpg";
import buschStadiumMap from "@/assets/venues/busch-stadium-seating.jpg";
import petcoParkMap from "@/assets/venues/petco-park-seating.jpg";
// WNBA / NBA arena maps
import barclayCenterMap from "@/assets/venues/barclays-center-seating.jpg";
import scotiabankarenaMap from "@/assets/venues/scotiabank-arena-seating.png";
import gainbridgeFieldhouseMap from "@/assets/venues/gainbridge-fieldhouse-seating.jpg";
import wintrustArenaMap from "@/assets/venues/wintrust-arena-seating.jpg";
import moheganSunArenaMap from "@/assets/venues/mohegan-sun-arena-seating.jpg";
import gatewayCenterArenaMap from "@/assets/venues/gateway-center-arena-seating.jpg";
import esaMap from "@/assets/venues/esa-seating.jpg";
import michelobUltraArenaMap from "@/assets/venues/michelob-ultra-arena-seating.jpg";
import climatePledgeArenaMap from "@/assets/venues/climate-pledge-arena-seating.jpg";
import footprintCenterMap from "@/assets/venues/footprint-center-seating.jpg";
import cryptoArenaMap from "@/assets/venues/crypto-arena-seating.jpg";
import targetCenterMap from "@/assets/venues/target-center-seating.jpg";
import collegeParkCenterMap from "@/assets/venues/college-park-center-seating.jpg";
import chaseCenterMap from "@/assets/venues/chase-center-seating.jpg";

// Rogers Centre section overlays
const ROGERS_CENTRE_SECTIONS = [
  // 500 Level (Pink)
  { id: "500L", label: "500 Level Left", color: "hsl(330, 80%, 55%)", left: 2, top: 2, width: 22, height: 20 },
  { id: "500C", label: "500 Level Centre", color: "hsl(330, 80%, 55%)", left: 26, top: 0, width: 48, height: 10 },
  { id: "500R", label: "500 Level Right", color: "hsl(330, 80%, 55%)", left: 76, top: 2, width: 22, height: 20 },
  { id: "500B", label: "500 Level Behind Home", color: "hsl(330, 80%, 55%)", left: 15, top: 78, width: 70, height: 12 },
  // 200 Level (Neon Yellow)
  { id: "200L", label: "200 Level Left", color: "hsl(65, 100%, 50%)", left: 8, top: 18, width: 18, height: 16 },
  { id: "200C", label: "200 Level Centre", color: "hsl(65, 100%, 50%)", left: 28, top: 10, width: 44, height: 10 },
  { id: "200R", label: "200 Level Right", color: "hsl(65, 100%, 50%)", left: 74, top: 18, width: 18, height: 16 },
  // TD Terrace (Dark Blue)
  { id: "TDT", label: "TD Terrace", color: "hsl(220, 80%, 30%)", left: 30, top: 20, width: 40, height: 10 },
  // Premium Ticketmaster Lounge (Light Blue)
  { id: "PTML", label: "Premium Ticketmaster Lounge (Left)", color: "hsl(195, 80%, 60%)", left: 60, top: 42, width: 8, height: 14 },
  { id: "PTMR", label: "Premium Ticketmaster Lounge (Right)", color: "hsl(195, 80%, 60%)", left: 32, top: 42, width: 8, height: 14 },
  // 100 Level Infield (Puke Green)
  { id: "100L", label: "100 Level Infield Left", color: "hsl(55, 50%, 40%)", left: 10, top: 62, width: 28, height: 18 },
  { id: "100R", label: "100 Level Infield Right", color: "hsl(55, 50%, 40%)", left: 62, top: 62, width: 28, height: 18 },
  { id: "100B", label: "100 Level Behind Home", color: "hsl(55, 50%, 40%)", left: 28, top: 68, width: 44, height: 14 },
  // Rogers Premium Banner Lounge (Dark Yellow)
  { id: "RPBL", label: "Rogers Premium Banner Lounge (Left)", color: "hsl(42, 90%, 45%)", left: 22, top: 34, width: 8, height: 10 },
  { id: "RPBR", label: "Rogers Premium Banner Lounge (Right)", color: "hsl(42, 90%, 45%)", left: 70, top: 34, width: 8, height: 10 },
  // KPMG Premium Blueprint Lounge (Red)
  { id: "KPMG", label: "KPMG Premium Blueprint Lounge", color: "hsl(0, 75%, 50%)", left: 8, top: 38, width: 14, height: 16 },
  // Premium TD Lounge (Blue)
  { id: "PTD", label: "Premium TD Lounge", color: "hsl(210, 70%, 50%)", left: 78, top: 38, width: 14, height: 16 },
  // Scorebet Seats (Orange)
  { id: "SBL", label: "Scorebet Seats (Left)", color: "hsl(25, 95%, 55%)", left: 6, top: 34, width: 5, height: 12 },
  { id: "SBR", label: "Scorebet Seats (Right)", color: "hsl(25, 95%, 55%)", left: 89, top: 34, width: 5, height: 12 },
  // 100 Level Outfield (Regular Green)
  { id: "100OL", label: "100 Level Outfield Left", color: "hsl(120, 50%, 40%)", left: 4, top: 28, width: 10, height: 20 },
  { id: "100OR", label: "100 Level Outfield Right", color: "hsl(120, 50%, 40%)", left: 86, top: 28, width: 10, height: 20 },
];

// Venue-specific seating map images
const VENUE_MAPS: Record<string, string> = {
  "Rogers Centre": rogersCentreMap,
  "Yankee Stadium": yankeeStadiumMap,
  "Fenway Park": fenwayParkMap,
  "Dodger Stadium": dodgerStadiumMap,
  "Wrigley Field": wrigleyFieldMap,
  "Truist Park": truistParkMap,
  "Citi Field": citiFieldMap,
  "Oracle Park": oracleParkMap,
  "Busch Stadium": buschStadiumMap,
  "Petco Park": petcoParkMap,
  // WNBA & NBA arenas
  "Barclays Center": barclayCenterMap,
  "Scotiabank Arena": scotiabankarenaMap,
  "Gainbridge Fieldhouse": gainbridgeFieldhouseMap,
  "Wintrust Arena": wintrustArenaMap,
  "Mohegan Sun Arena": moheganSunArenaMap,
  "Gateway Center Arena": gatewayCenterArenaMap,
  "Entertainment & Sports Arena": esaMap,
  "Michelob Ultra Arena": michelobUltraArenaMap,
  "Climate Pledge Arena": climatePledgeArenaMap,
  "Footprint Center": footprintCenterMap,
  "Crypto.com Arena": cryptoArenaMap,
  "Target Center": targetCenterMap,
  "College Park Center": collegeParkCenterMap,
  "Chase Center": chaseCenterMap,
};

// Display name mapping
const VENUE_DISPLAY_NAMES: Record<string, string> = {
  "Rogers Centre": "Rogers Centre",
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
  defaultCollapsedOnMobile?: boolean;
}

const SeatingMap = ({ availableSections, selectedSection, setSelectedSection, game, teamLogo, teamColor, defaultCollapsedOnMobile = true }: SeatingMapProps) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mapZoomed, setMapZoomed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMapOpen, setMobileMapOpen] = useState(!defaultCollapsedOnMobile);

  const venueMap = VENUE_MAPS[game.venue];
  const isRogersCentre = game.venue === "Rogers Centre";
  const sections = isRogersCentre ? ROGERS_CENTRE_SECTIONS : [];
  const displayName = VENUE_DISPLAY_NAMES[game.venue] || game.venue;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });

  const showMap = !isMobile || mobileMapOpen;

  return (
    <div>
      {/* Mobile collapsed pill */}
      {isMobile && (
        <button
          onClick={() => setMobileMapOpen((v) => !v)}
          className="w-full mb-3 flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-all min-h-[48px]"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapIcon className="h-4 w-4 text-primary" />
            {mobileMapOpen ? "Hide" : "View"} Seating Map · {displayName}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileMapOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {showMap && (
        <>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 hidden md:block">
            {displayName} Seating Map
          </h2>
          <div className="bg-card border border-border rounded-xl p-4 relative shadow-lg">
        {venueMap ? (
          <div className="relative group">
            <img
              src={venueMap}
              alt={`${displayName} Seating Chart`}
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
                      : "transparent",
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
            <h3 className="text-white font-display text-xl font-bold text-center">{displayName}</h3>
            <p className="text-white/60 text-sm mt-1">{game.city}</p>
            <p className="text-white/40 text-xs mt-4 italic">Interactive seating map coming soon</p>
          </div>
        )}

        {isRogersCentre && (
          <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(330, 80%, 55%)" }} /> 500 Level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(65, 100%, 50%)" }} /> 200 Level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(220, 80%, 30%)" }} /> TD Terrace</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(55, 50%, 40%)" }} /> 100 Level</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(120, 50%, 40%)" }} /> 100 Outfield</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(195, 80%, 60%)" }} /> Ticketmaster Lounge</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(0, 75%, 50%)" }} /> KPMG Lounge</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(210, 70%, 50%)" }} /> TD Lounge</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(42, 90%, 45%)" }} /> Banner Lounge</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "hsl(25, 95%, 55%)" }} /> Scorebet Seats</span>
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
          <img src={venueMap} alt={`${displayName} Seating Chart - Full Size`} className="max-w-full max-h-[90vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
        </>
      )}

      {/* Game info card */}
      <div className="bg-card border border-border rounded-xl p-4 mt-4 space-y-2 shadow-lg">
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
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary" />{displayName}, {game.city}</span>
        </div>
      </div>
    </div>
  );
};

export default SeatingMap;
