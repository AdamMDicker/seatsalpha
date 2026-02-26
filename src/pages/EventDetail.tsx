import { useParams, Link } from "react-router-dom";
import { mockEvents } from "@/data/mockEvents";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Car, Plane, Hotel, Crown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ticketTiers = [
  { id: "upper", label: "Upper Bowl", price: 0, description: "Great view of the action" },
  { id: "lower", label: "Lower Bowl", price: 40, description: "Closer to the excitement" },
  { id: "floor", label: "Floor / Premium", price: 120, description: "The ultimate experience" },
];

const EventDetail = () => {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);
  const [selectedTier, setSelectedTier] = useState("upper");
  const [quantity, setQuantity] = useState(2);
  const [uberSelected, setUberSelected] = useState(false);
  const [hotelSelected, setHotelSelected] = useState(false);
  const [flightSelected, setFlightSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isMember } = useAuth();
  const { toast } = useToast();

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const tier = ticketTiers.find((t) => t.id === selectedTier)!;
  const ticketPrice = event.priceFrom + tier.price;
  const total = ticketPrice * quantity + (uberSelected ? 25 : 0) + (hotelSelected ? 189 : 0) + (flightSelected ? 299 : 0);

  const handleBuy = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          eventTitle: event.title,
          totalAmount: total,
          quantity,
          tier: tier.label,
          uberAdded: uberSelected,
          hotelAdded: hotelSelected,
          flightAdded: flightSelected,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                {event.isOwn && (
                  <span className="inline-block px-2 py-1 rounded-md bg-success/15 text-success text-xs font-semibold mb-3">✓ No Fees</span>
                )}
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />{event.date} · {event.time}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{event.venue}, {event.city}</span>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg mb-4">Select Your Seats</h3>
                <div className="space-y-3">
                  {ticketTiers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                        selectedTier === t.id ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-foreground">{t.label}</p>
                          <p className="text-sm text-muted-foreground">{t.description}</p>
                        </div>
                        <span className="font-display font-bold text-lg">${event.priceFrom + t.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-lg mb-4">Enhance Your Experience</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={() => setUberSelected(!uberSelected)} className={`p-4 rounded-xl border text-left transition-all ${uberSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
                    <Car className="h-5 w-5 text-primary mb-2" />
                    <p className="font-semibold text-sm">Uber Ride</p>
                    <p className="text-xs text-muted-foreground">Round trip to venue</p>
                    <p className="font-display font-bold mt-2 text-gold">+$25</p>
                  </button>
                  <button onClick={() => setHotelSelected(!hotelSelected)} className={`p-4 rounded-xl border text-left transition-all ${hotelSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
                    <Hotel className="h-5 w-5 text-primary mb-2" />
                    <p className="font-semibold text-sm">Hotel Stay</p>
                    <p className="text-xs text-muted-foreground">Near venue, 1 night</p>
                    <p className="font-display font-bold mt-2 text-gold">+$189</p>
                  </button>
                  <button onClick={() => setFlightSelected(!flightSelected)} className={`p-4 rounded-xl border text-left transition-all ${flightSelected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}>
                    <Plane className="h-5 w-5 text-primary mb-2" />
                    <p className="font-semibold text-sm">Flight Deal</p>
                    <p className="text-xs text-muted-foreground">Best fare to {event.city}</p>
                    <p className="font-display font-bold mt-2 text-gold">+$299</p>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="glass rounded-xl p-6 sticky top-24 space-y-5">
                <h3 className="font-display font-semibold text-lg">Order Summary</h3>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Quantity</label>
                  <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} ticket{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{quantity}x {tier.label}</span><span>${ticketPrice * quantity}</span></div>
                  {uberSelected && <div className="flex justify-between"><span className="text-muted-foreground">Uber Ride</span><span>$25</span></div>}
                  {hotelSelected && <div className="flex justify-between"><span className="text-muted-foreground">Hotel Stay</span><span>$189</span></div>}
                  {flightSelected && <div className="flex justify-between"><span className="text-muted-foreground">Flight</span><span>$299</span></div>}
                  <div className="flex justify-between text-sm text-success font-medium pt-1"><span>Service Fees</span><span>$0.00</span></div>
                  <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-lg"><span>Total</span><span>${total}</span></div>
                </div>
                <Button variant="hero" className="w-full animate-pulse-glow" size="lg" onClick={handleBuy} disabled={loading}>
                  {loading ? "Processing..." : "Buy Tickets"}
                </Button>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Crown className="h-3 w-3 text-gold" />
                    <span>{isMember ? "Fee-free as a member!" : "Members save on every purchase"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;
