import { useState } from "react";
import EventCard from "@/components/EventCard";
import { mockEvents, categories } from "@/data/mockEvents";

const EventsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredEvents = activeCategory === "all"
    ? mockEvents
    : mockEvents.filter((e) => e.category === activeCategory);

  // Sort: own tickets first
  const sortedEvents = [...filteredEvents].sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0));

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Upcoming <span className="text-gradient">Events</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Browse thousands of events across Canada. No hidden fees, ever.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {categories.map((cat) => (
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event, i) => (
            <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
