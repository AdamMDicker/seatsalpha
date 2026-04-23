import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Car, ExternalLink, Home, Hotel, Plane, Crown, ShoppingBag, CalendarDays, MapPin, Armchair, Ticket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { getUberDeepLink } from "@/utils/uberDeepLink";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { mapRogersCentreSectionToCategory } from "@/utils/sectionCategoryMap";
import { useAuth } from "@/contexts/AuthContext";
import FulfillmentIssueBanner from "@/components/FulfillmentIssueBanner";

interface UpsellCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  live: boolean;
  href?: string;
}

function formatEventDate(raw: string): string {
  try {
    const decoded = decodeURIComponent(raw);
    const date = new Date(decoded);
    if (isNaN(date.getTime())) {
      // Fallback: strip ISO artifacts for display
      return decoded.replace(/T/g, " ").replace(/\+00:00|Z$/g, "").trim();
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Toronto",
    }) + " · " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Toronto",
    }) + " EST";
  } catch {
    return raw;
  }
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const venue = searchParams.get("venue");
  const eventTitle = searchParams.get("event");
  const tier = searchParams.get("tier");
  const eventDate = searchParams.get("date");
  const qty = searchParams.get("qty");
  const uberLink = venue ? getUberDeepLink(venue) : null;
  const [aiViewUrl, setAiViewUrl] = useState<string | null>(null);

  // Fetch AI-generated section reference view as a fallback "what your seats look like" preview.
  useEffect(() => {
    const venueName = venue ? decodeURIComponent(venue) : null;
    const sectionName = tier ? decodeURIComponent(tier) : null;
    if (!venueName || !sectionName) return;

    // Currently only Rogers Centre has section view mappings.
    if (!venueName.toLowerCase().includes("rogers centre")) return;

    const categoryId = mapRogersCentreSectionToCategory(sectionName);
    if (!categoryId) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("venue_section_views")
        .select("image_url")
        .eq("venue", "Rogers Centre")
        .eq("section_id", categoryId)
        .maybeSingle();
      if (!cancelled && !error && data?.image_url) {
        setAiViewUrl(data.image_url);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [venue, tier]);

  const upsellCards: UpsellCard[] = [
    ...(uberLink
      ? [
          {
            icon: <Car className="h-6 w-6" />,
            title: "Uber to the Game",
            description: `Get dropped off right at ${venue ? decodeURIComponent(venue) : "the venue"}. No parking, no hassle.`,
            cta: "Book Uber",
            live: true,
            href: uberLink,
          },
        ]
      : []),
    {
      icon: <Hotel className="h-6 w-6" />,
      title: "Book a Hotel",
      description: "Travelling for the game? Find deals on nearby hotels.",
      cta: "Coming Soon",
      live: false,
    },
    {
      icon: <Plane className="h-6 w-6" />,
      title: "Book a Flight",
      description: "Flying in? Compare flights to get the best fare.",
      cta: "Coming Soon",
      live: false,
    },
    {
      icon: <Crown className="h-6 w-6" />,
      title: "Limo Service",
      description: "Arrive in style with private car service to the venue.",
      cta: "Coming Soon",
      live: false,
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Fan Gear",
      description: "Rep your team — jerseys, hats, and more delivered to your door.",
      cta: "Coming Soon",
      live: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto space-y-8">
        {/* Confirmation card */}
        <div className="glass rounded-2xl p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Payment Successful!</h1>
            {eventTitle && (
              <p className="text-primary font-display font-semibold mt-2 text-lg">
                {decodeURIComponent(eventTitle)}
              </p>
            )}
          </div>

          {/* Order details */}
          {(eventDate || venue || tier || qty) && (
            <div className="inline-flex flex-col gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-xl px-6 py-4 mx-auto">
              {eventDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{formatEventDate(eventDate)}</span>
                </div>
              )}
              {venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{decodeURIComponent(venue)}</span>
                </div>
              )}
              {tier && (
                <div className="flex items-center gap-2">
                  <Armchair className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{decodeURIComponent(tier)}</span>
                </div>
              )}
              {qty && (
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{qty} {parseInt(qty) === 1 ? "ticket" : "tickets"}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-muted-foreground">
            Your tickets have been confirmed. Check your email for details.
          </p>

          <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mt-2">
            <p className="text-primary text-sm font-semibold">
              📧 If you don't see the confirmation email, please check your spam/junk folder.
            </p>
          </div>
        </div>

        {/* AI-generated section reference view (fallback when no real seat photos) */}
        {aiViewUrl && (
          <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Your section view
                </h3>
                <p className="text-sm text-muted-foreground">
                  A reference shot of what fans see from {tier ? decodeURIComponent(tier) : "your section"}.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                <Sparkles className="h-3 w-3" />
                AI reference
              </span>
            </div>
            <img
              src={aiViewUrl}
              alt={`Reference view from section ${tier ? decodeURIComponent(tier) : ""} at ${venue ? decodeURIComponent(venue) : "the venue"}`}
              className="w-full aspect-video object-cover"
              loading="lazy"
            />
            <p className="px-5 py-3 text-xs text-muted-foreground border-t border-border">
              AI-generated reference — actual view from your exact seat may differ.
            </p>
          </div>
        )}

        {/* Upsell section hidden for now */}
        {false && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground text-center">
              Enhance Your Game Day
            </h2>
          </div>
        )}

        <div className="text-center">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
