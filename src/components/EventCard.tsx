import { Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/data/mockEvents";
import { Link } from "react-router-dom";
import { getEventTeamPath } from "@/utils/eventToTeamRoute";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const isSoldOut = event.priceFrom === 0 || event.priceFrom === undefined;

  return (
    <Link to={getEventTeamPath(event.title, event.id)} className="group block">
      <div className={`rounded-xl overflow-hidden bg-card border shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        isSoldOut
          ? "border-border opacity-75"
          : "border-border hover:border-primary/40 hover:shadow-xl"
      }`}>
        <div className="relative h-48 overflow-hidden bg-secondary flex items-center justify-center p-6">
          <h2 className="font-display text-xl font-bold text-foreground text-center leading-snug">
            {event.title}
          </h2>
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide">
              {event.category}
            </span>
          </div>
          {isSoldOut && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-xs font-bold uppercase">
                Sold Out
              </span>
            </div>
          )}
          {!isSoldOut && event.isOwn && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-md bg-success/80 text-success-foreground text-xs font-semibold">
                No Fees
              </span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium text-foreground/80">{event.date}</span>
              <span>· {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            {isSoldOut ? (
              <div>
                <span className="text-sm font-bold text-destructive uppercase">Sold Out</span>
                <p className="text-[9px] text-muted-foreground">Check back soon</p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-gold" />
                <span className="text-sm text-muted-foreground">From</span>
                <span className="font-display font-bold text-foreground">${event.priceFrom} CAD</span>
                <span className="text-[9px] text-emerald-400 ml-1">LCC-included for members</span>
              </div>
            )}
            <Button variant="hero" size="sm" className="text-xs" disabled={isSoldOut}>
              {isSoldOut ? "Unavailable" : "Get Tickets"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
