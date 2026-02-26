import { Gift, Home, Plane } from "lucide-react";

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
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });

  const isHome = game.description?.includes("Home") || (!game.title.includes("@") && !game.description?.includes("Away"));
  const isAway = game.description?.includes("Away") || game.title.includes("@");

  // Extract opponent name from title
  const getOpponent = () => {
    if (game.title.includes(" vs ")) {
      return game.title.split(" vs ").pop()?.trim();
    }
    if (game.title.includes(" @ ")) {
      return game.title.split(" @ ").pop()?.trim();
    }
    return null;
  };
  const opponent = getOpponent();

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-xl p-3 text-left transition-all min-w-[180px] border relative overflow-hidden ${
        isSelected
          ? "bg-primary/15 border-primary shadow-lg shadow-primary/10"
          : "glass hover:border-primary/30"
      }`}
    >
      {/* Home/Away indicator strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isAway ? "bg-amber-500" : "bg-emerald-500"}`} />

      <div className="flex items-center gap-2 mb-1 mt-1">
        {teamLogo && <img src={teamLogo} alt="" className="w-5 h-5 object-contain" />}
        <p className="text-xs font-semibold text-primary">{formatDate(game.event_date)}</p>
      </div>
      <p className="text-xs text-muted-foreground">{formatTime(game.event_date)}</p>

      {/* Home/Away badge */}
      <div className="flex items-center gap-1.5 mt-1.5">
        {isAway ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
            <Plane className="h-2.5 w-2.5" /> Away
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
            <Home className="h-2.5 w-2.5" /> Home
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-foreground mt-1.5 line-clamp-2">
        {isAway ? "@ " : "vs "}{opponent || game.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{game.venue}</p>

      {/* Giveaway badge */}
      {game.is_giveaway && (
        <div className="flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground w-fit">
          <Gift className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">
            {game.giveaway_item || "Giveaway"}
          </span>
        </div>
      )}

      {game.tickets.length > 0 ? (
        <p className="text-xs text-primary mt-1.5 font-medium">
          From ${Math.min(...game.tickets.map((t) => t.price))}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground mt-1.5">No tickets yet</p>
      )}
    </button>
  );
};

export default GameCard;
