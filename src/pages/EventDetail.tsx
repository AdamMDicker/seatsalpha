import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Car, ExternalLink } from "lucide-react";
import { getUberDeepLink } from "@/utils/uberDeepLink";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TicketListings from "@/components/team/TicketListings";
import { expandTeamNames } from "@/utils/teamNameUtils";

interface TicketInfo {
  id: string;
  section: string;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_reseller_ticket: boolean;
  perks: string[] | null;
  seat_notes: string | null;
  hide_seat_numbers?: boolean;
  face_value?: number | null;
}

interface EventData {
  id: string;
  title: string;
  venue: string;
  city: string;
  province: string;
  event_date: string;
  description: string | null;
  category: string;
  image_url: string | null;
  is_giveaway: boolean;
  giveaway_item: string | null;
}

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      const { data: ev } = await supabase
        .from("events")
        .select("id, title, venue, city, province, event_date, description, category, image_url, is_giveaway, giveaway_item")
        .eq("id", id)
        .single();

      if (ev) {
        setEvent(ev);
        const { data: tix } = await (supabase
          .from("public_tickets" as any)
          .select("id, section, row_name, seat_number, price, quantity, quantity_sold, is_reseller_ticket, perks, seat_notes, hide_seat_numbers, face_value")
          .eq("event_id", ev.id)
          .order("price", { ascending: true }) as any);
        setTickets(tix || []);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground mb-4">Event not found.</p>
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const formattedTime = new Date(event.event_date).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
  const uberLink = getUberDeepLink(event.venue);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{expandTeamNames(event.title)}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {formattedDate} · {formattedTime}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {event.venue}, {event.city}, {event.province}
              </span>
            </div>

            {uberLink && (
              <a href={uberLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline">
                <Car className="h-4 w-4" />
                Uber to the Game
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {tickets.length > 0 ? (
            <TicketListings
              tickets={tickets}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              isGiveaway={event.is_giveaway}
              giveawayItem={event.giveaway_item}
              gameTitle={event.title}
              venueName={event.venue}
              eventDate={event.event_date}
            />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No tickets available yet</p>
              <p className="text-sm">Check back later for ticket listings.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;
