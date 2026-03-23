import { Gift, Home, Plane } from "lucide-react";
import { expandTeamNames } from "@/utils/teamNameUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameCardProps {
  game: {
    id: string;
    title: string;
    venue: string;
    event_date: string;
    description: string | null;
    is_giveaway?: boolean;
    giveaway_item?: string | null;
    tickets: { price: number }[];
  };
  isSelected: boolean;
  onClick: () => void;
  teamLogo?: string;
}

const GameCard = ({ game, isSelected, onClick, teamLogo }: GameCardProps) => {
  const isMobile = useIsMobile();
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });

  const isHome = game.description?.includes("Home") || (!game.title.includes("@") && !game.description?.includes("Away"));
  const isAway = game.description?.includes("Away") || game.title.includes("@");

  const getOpponent = () => {
    if (game.title.includes(" vs ")) return game.title.split(" vs ").pop()?.trim();
    if (game.title.includes(" @ ")) return game.title.split(" @ ").pop()?.trim();
    return null;
  };
  const opponent = getOpponent();
  const cheapest = game.tickets.length > 0 ? Math.min(...game.tickets.map((t) => t.price)) : null;

  // --- MOBILE: compact single-row card ---
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left rounded-lg p-3 transition-all border relative ${
          game.is_giveaway
            ? isSelected
              ? "bg-primary/15 border-primary/60 ring-1 ring-primary/30"
              : "bg-primary/5 border-primary/30 hover:border-primary/50"
            : isSelected
              ? "bg-yellow-400/15 border-yellow-400/60 ring-1 ring-yellow-400/30"
              : "bg-card border-border hover:border-primary/30"
        }`}
      >
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${game.is_giveaway ? "bg-primary" : isAway ? "bg-amber-500" : "bg-emerald-500"}`} />
        <div className="flex items-center gap-3">
          {teamLogo && <img src={teamLogo} alt="" className="w-8 h-8 object-contain flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{formatDate(game.event_date)}</span>
              <span className="text-xs text-muted-foreground">{formatTime(game.event_date)}</span>
              {isAway ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                  <Plane className="h-2.5 w-2.5" /> Away
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                  <Home className="h-2.5 w-2.5" /> Home
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground truncate">
              {isAway ? "@ " : "vs "}{opponent ? expandTeamNames(opponent) : expandTeamNames(game.title)}
            </p>
            {game.is_giveaway && (
              <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 w-fit">
                <Gift className="h-3 w-3 text-primary animate-bounce" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                  {game.giveaway_item || "Giveaway"}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            {cheapest !== null ? (
              <>
                <span className="text-sm text-emerald-400 font-semibold">${cheapest} CAD</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </button>
    );
  }

  // --- DESKTOP: original card ---
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-xl p-4 text-left transition-all w-[220px] min-h-[200px] border relative overflow-hidden flex flex-col ${
        game.is_giveaway
          ? isSelected
            ? "bg-primary/15 border-primary/60 shadow-lg shadow-primary/20 ring-1 ring-primary/30"
            : "bg-primary/5 border-primary/30 hover:border-primary/50 shadow-md shadow-primary/10"
            : isSelected
              ? "bg-yellow-400/15 border-yellow-400/60 shadow-lg shadow-yellow-400/10 ring-1 ring-yellow-400/30"
            : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${game.is_giveaway ? "bg-gradient-to-r from-primary via-primary to-primary/60" : isAway ? "bg-amber-500" : "bg-emerald-500"}`} />

      <div className="flex items-center gap-2 mb-1.5 mt-1">
        {teamLogo && <img src={teamLogo} alt="" className="w-6 h-6 object-contain" />}
        <p className="text-sm font-semibold text-primary">{formatDate(game.event_date)}</p>
      </div>
      <p className="text-sm text-muted-foreground">{formatTime(game.event_date)}</p>

      <div className="flex items-center gap-1.5 mt-2">
        {isAway ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400">
            <Plane className="h-3 w-3" /> Away
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400">
            <Home className="h-3 w-3" /> Home
          </span>
        )}
      </div>

      <p className="text-base font-medium text-foreground mt-2 line-clamp-2">
        {isAway ? "@ " : "vs "}{opponent ? expandTeamNames(opponent) : expandTeamNames(game.title)}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">{game.venue}</p>

      {game.is_giveaway && (
        <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-primary/20 border border-primary/40 w-fit">
          <Gift className="h-3.5 w-3.5 text-primary animate-bounce" />
          <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
            {game.giveaway_item || "Giveaway"}
          </span>
        </div>
      )}

      <div className="mt-auto pt-2">
        {cheapest !== null ? (
          <>
            <p className="text-sm text-emerald-400 font-semibold">From ${cheapest} CAD</p>
            <p className="text-[9px] text-emerald-400">Members enjoy HST-included pricing</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No tickets yet</p>
        )}
      </div>
    </button>
  );
};

export default GameCard;
