import { useState, useMemo } from "react";
import { CalendarDays, Users, DollarSign, Hash, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GameEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  province: string;
  event_date: string;
  description: string | null;
  is_giveaway?: boolean;
  giveaway_item?: string | null;
  tickets: { price: number; quantity: number; quantity_sold: number }[];
}

interface GameScheduleFiltersProps {
  games: GameEvent[];
  filter: "all" | "home" | "away";
  setFilter: (f: "all" | "home" | "away") => void;
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedOpponent: string;
  setSelectedOpponent: (o: string) => void;
  maxBudget: number | null;
  setMaxBudget: (b: number | null) => void;
  minTickets: number | null;
  setMinTickets: (n: number | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
}

const GameScheduleFilters = ({
  games,
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
}: GameScheduleFiltersProps) => {
  const [showBudget, setShowBudget] = useState(false);

  // Extract unique months from games
  const months = useMemo(() => {
    const monthSet = new Map<string, string>();
    games.forEach((g) => {
      const d = new Date(g.event_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-CA", { month: "short", year: "numeric" });
      monthSet.set(key, label);
    });
    return Array.from(monthSet.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [games]);

  // Extract unique opponents from game titles
  const opponents = useMemo(() => {
    const opSet = new Set<string>();
    games.forEach((g) => {
      const parts = g.title.split(/\s+vs\.?\s+/i);
      if (parts.length === 2) {
        const opp = parts[0].includes("Blue Jays") ? parts[1].trim() : parts[0].trim();
        if (opp) opSet.add(opp);
      }
    });
    return Array.from(opSet).sort();
  }, [games]);

  // Available dates for the date picker
  const availableDates = useMemo(() => {
    return games.map((g) => new Date(g.event_date));
  }, [games]);

  // Price range
  const priceRange = useMemo(() => {
    let min = Infinity, max = 0;
    games.forEach((g) => {
      g.tickets.forEach((t) => {
        if (t.price < min) min = t.price;
        if (t.price > max) max = t.price;
      });
    });
    return { min: min === Infinity ? 0 : Math.floor(min), max: max === 0 ? 500 : Math.ceil(max) };
  }, [games]);

  return (
    <div className="space-y-3 mb-6">
      {/* Row 1: Month + Date + Opponent + Tickets + Budget */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Month picker */}
        <Select
          value={selectedDate ? "__date__" : selectedMonth}
          onValueChange={(v) => {
            if (v !== "__date__") {
              setSelectedMonth(v);
              setSelectedDate(null);
            }
          }}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary border-border">
            <CalendarDays className="h-3 w-3 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="all">All Months</SelectItem>
            {months.map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Specific date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "h-8 text-xs bg-secondary border-border px-3",
                selectedDate ? "text-primary border-primary/30" : "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-3 w-3 mr-1.5" />
              {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Specific Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(d) => {
                setSelectedDate(d || null);
                if (d) setSelectedMonth("all");
              }}
              className={cn("p-3 pointer-events-auto")}
            />
            {selectedDate && (
              <div className="px-3 pb-3">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setSelectedDate(null)}>
                  Clear date
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Opponent picker */}
        {opponents.length > 0 && (
          <Select value={selectedOpponent} onValueChange={setSelectedOpponent}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-secondary border-border">
              <Users className="h-3 w-3 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Opponents" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">All Opponents</SelectItem>
              {opponents.map((opp) => (
                <SelectItem key={opp} value={opp}>{opp}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Number of tickets filter */}
        <Select value={minTickets?.toString() || "any"} onValueChange={(v) => setMinTickets(v === "any" ? null : parseInt(v))}>
          <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary border-border">
            <Hash className="h-3 w-3 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="# Tickets" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="any">Any # Tickets</SelectItem>
            <SelectItem value="2">2+ Tickets</SelectItem>
            <SelectItem value="3">3+ Tickets</SelectItem>
            <SelectItem value="4">4+ Tickets</SelectItem>
            <SelectItem value="6">6+ Tickets</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

        {/* Budget toggle */}
        <button
          onClick={() => setShowBudget(!showBudget)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            maxBudget !== null
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <DollarSign className="h-3 w-3" />
          {maxBudget !== null ? `Under $${maxBudget}/seat` : "Budget"}
        </button>
      </div>

      {/* Budget slider row */}
      {showBudget && (
        <div className="glass rounded-lg p-3 flex items-center gap-4 animate-fade-in">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Max budget per seat:</span>
          <Slider
            min={priceRange.min}
            max={priceRange.max}
            step={5}
            value={[maxBudget ?? priceRange.max]}
            onValueChange={([v]) => setMaxBudget(v)}
            className="flex-1"
          />
          <span className="text-xs font-semibold text-foreground w-14 text-right">
            ${maxBudget ?? priceRange.max} CAD
          </span>
          {maxBudget !== null && (
            <button
              onClick={() => setMaxBudget(null)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameScheduleFilters;
