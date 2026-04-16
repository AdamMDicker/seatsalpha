import { useState, useEffect } from "react";
import { getTodayStartISO } from "@/utils/dateFilters";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "@/components/EventCard";
import { categories } from "@/data/mockEvents";
import type { Event } from "@/data/mockEvents";
import { MLB_LOGOS } from "@/data/mlbLogos";
import { expandTeamNames } from "@/utils/teamNameUtils";

const TEAM_KEYWORD_TO_SLUG: Record<string, string> = {
  "yankees": "yankees", "red sox": "red-sox", "rays": "rays", "orioles": "orioles",
  "guardians": "guardians", "tigers": "tigers", "royals": "royals", "twins": "twins",
  "white sox": "white-sox", "astros": "astros", "rangers": "rangers", "mariners": "mariners",
  "angels": "angels", "athletics": "athletics", "braves": "braves", "mets": "mets",
  "phillies": "phillies", "marlins": "marlins", "nationals": "nationals", "cubs": "cubs",
  "brewers": "brewers", "cardinals": "cardinals", "reds": "reds", "pirates": "pirates",
  "dodgers": "dodgers", "padres": "padres", "giants": "giants", "diamondbacks": "diamondbacks",
  "rockies": "rockies",
};

const getOpponentLogo = (title: string): string | null => {
  const lower = title.toLowerCase();
  for (const [keyword, slug] of Object.entries(TEAM_KEYWORD_TO_SLUG)) {
    if (lower.includes(keyword) && slug !== "blue-jays") {
      return MLB_LOGOS[slug] || null;
    }
  }
  return null;
};

const EventsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const now = getTodayStartISO();
      const { data: dbEvents } = await supabase
        .from("events")
        .select("id, title, venue, city, province, event_date, category, image_url, description")
        .gte("event_date", now)
        .order("event_date", { ascending: true })
        .limit(20);

      if (dbEvents && dbEvents.length > 0) {
        const eventsWithInfo = (await Promise.all(
          dbEvents.map(async (ev) => {
            const { data: tickets } = await (supabase
              .from("public_tickets" as any)
              .select("is_reseller_ticket, price, quantity, quantity_sold")
              .eq("event_id", ev.id)
              .limit(200) as any);

            const availableTickets = (tickets ?? []).filter(
              (ticket) =>
                typeof ticket.price === "number" &&
                ticket.price > 0 &&
                typeof ticket.quantity === "number" &&
                typeof ticket.quantity_sold === "number" &&
                ticket.quantity > ticket.quantity_sold
            );

            if (availableTickets.length === 0) return null;

            const hasInternalTickets = availableTickets.some((ticket) => !ticket.is_reseller_ticket);
            const minPrice = Math.min(...availableTickets.map((ticket) => ticket.price));
            const opponentLogo = getOpponentLogo(ev.title);

            return {
              id: ev.id,
              title: expandTeamNames(ev.title),
              venue: ev.venue,
              city: `${ev.city}, ${ev.province}`,
              date: new Date(ev.event_date).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" }),
              time: new Date(ev.event_date).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true }),
              category: (ev.category as Event["category"]) || "sports",
              priceFrom: minPrice,
              image: opponentLogo || ev.image_url || "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=600&h=400&fit=crop",
              isOwn: hasInternalTickets,
            } satisfies Event;
          })
        )).filter((event): event is Event => event !== null);

        eventsWithInfo.sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0));
        setEvents(eventsWithInfo);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = activeCategory === "all"
    ? events
    : events.filter((e) => e.category === activeCategory);

  const displayEvents = filteredEvents.slice(0, 6);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Don't miss out</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Upcoming Events
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Browse games and lock in your seats — no hidden fees, ever.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.filter(cat => cat.id !== "concerts" && cat.id !== "theatre").map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading events...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((event, i) => (
                <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
              {displayEvents.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  No events found in this category.
                </div>
              )}
            </div>

            {displayEvents.length > 0 && (
              <div className="text-center mt-10">
                <Link
                  to="/teams/blue-jays"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                >
                  View All Blue Jays Games
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
