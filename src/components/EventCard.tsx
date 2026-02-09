import { Calendar, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/data/mockEvents";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link to={`/event/${event.id}`} className="group block">
      <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-md bg-primary/90 text-primary-foreground text-xs font-semibold uppercase tracking-wide">
              {event.category}
            </span>
          </div>
          {event.isOwn && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-md bg-success/90 text-success-foreground text-xs font-semibold">
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
              <span>{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary/70" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-gold" />
              <span className="text-sm text-muted-foreground">From</span>
              <span className="font-display font-bold text-foreground">${event.priceFrom}</span>
            </div>
            <Button variant="hero" size="sm" className="text-xs">
              Get Tickets
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
