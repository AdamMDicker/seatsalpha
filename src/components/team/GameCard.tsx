import { Gift } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    title: string;
    venue: string;
    event_date: string;
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

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-xl p-3 text-left transition-all min-w-[170px] border ${
        isSelected
          ? "bg-primary/15 border-primary shadow-lg shadow-primary/10"
          : "glass hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {teamLogo && <img src={teamLogo} alt="" className="w-5 h-5 object-contain" />}
        <p className="text-xs font-semibold text-primary">{formatDate(game.event_date)}</p>
      </div>
      <p className="text-xs text-muted-foreground">{formatTime(game.event_date)}</p>
      <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">{game.title}</p>
      <p className="text-xs text-muted-foreground mt-1">{game.venue}</p>

      {/* Giveaway badge */}
      {game.is_giveaway && (
        <div className="flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded bg-accent/20 text-accent-foreground w-fit">
          <Gift className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">
            {game.giveaway_item || "Giveaway"}
          </span>
        </div>
      )}

      {game.tickets.length > 0 && (
        <p className="text-xs text-primary mt-1 font-medium">
          From ${Math.min(...game.tickets.map((t) => t.price))}
        </p>
      )}
    </button>
  );
};

export default GameCard;
