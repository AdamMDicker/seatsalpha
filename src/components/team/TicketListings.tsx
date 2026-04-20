import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Gift, Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
import { expandTeamNames } from "@/utils/teamNameUtils";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";
import { useIsMobile } from "@/hooks/use-mobile";
import FeeGateDialog from "./FeeGateDialog";
import MobileAuthSheet from "./MobileAuthSheet";

interface TicketInfo {
  id: string;
  section: string;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_reseller_ticket: boolean;
  perks?: string[] | null;
  seat_notes?: string | null;
  hide_seat_numbers?: boolean;
  split_type?: string | null;
  face_value?: number | null;
}

interface SeatImage {
  id: string;
  ticket_id: string;
  image_url: string;
  caption: string | null;
}

interface TicketListingsProps {
  tickets: TicketInfo[];
  selectedSection: string | null;
  setSelectedSection: (s: string | null) => void;
  isGiveaway?: boolean;
  giveawayItem?: string | null;
  gameTitle?: string;
  gameId?: string;
  venueName?: string;
  eventDate?: string;
}

const PERK_LABELS: Record<string, { label: string; emoji: string }> = {
  aisle: { label: "Aisle Seat", emoji: "🪑" },
  row1: { label: "Row 1", emoji: "🥇" },
  accessible: { label: "Accessible", emoji: "♿" },
  food: { label: "Food Included", emoji: "🍔" },
  drinks: { label: "Drinks Included", emoji: "🍺" },
  lounge: { label: "Lounge Access", emoji: "🛋️" },
  parking: { label: "Parking Included", emoji: "🅿️" },
  giveaway_guaranteed: { label: "Giveaway Guaranteed", emoji: "🎁" },
};

const getEdgeFunctionErrorMessage = async (err: any, fallback: string) => {
  const defaultMessage = err?.message || fallback;
  const context = err?.context;

  if (!context || typeof context.json !== "function") {
    return defaultMessage;
  }

  try {
    const body = await context.json();
    if (typeof body?.error === "string" && body.error.trim()) {
      return body.error;
    }
  } catch {
    // ignore body parsing issues
  }

  return defaultMessage;
};

const TicketListings = ({ tickets, selectedSection, setSelectedSection, isGiveaway, giveawayItem, gameTitle, gameId, venueName, eventDate }: TicketListingsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [seatImages, setSeatImages] = useState<Record<string, SeatImage[]>>({});
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [buyingTicketId, setBuyingTicketId] = useState<string | null>(null);
  const [feeGateTicket, setFeeGateTicket] = useState<TicketInfo | null>(null);
  const [lightboxImages, setLightboxImages] = useState<SeatImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [desiredSeats, setDesiredSeats] = useState("any");
  const [filterAisle, setFilterAisle] = useState(false);
  const [filterRow1, setFilterRow1] = useState(false);
  const [filterAccessible, setFilterAccessible] = useState(false);
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [pendingBuyTicket, setPendingBuyTicket] = useState<TicketInfo | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [memberCheckoutOverride, setMemberCheckoutOverride] = useState<boolean | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user, isMember, isAdmin, checkMembership } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const ids = tickets.map((t) => t.id);
    if (ids.length === 0) return;
    const fetchImages = async () => {
      const { data } = await supabase.from("seat_images").select("id, ticket_id, image_url, caption").in("ticket_id", ids);
      if (data) {
        const grouped: Record<string, SeatImage[]> = {};
        data.forEach((img) => {
          if (!grouped[img.ticket_id]) grouped[img.ticket_id] = [];
          grouped[img.ticket_id].push(img);
        });
        setSeatImages(grouped);
      }
    };
    fetchImages();
  }, [tickets]);

  // Auto-open FeeGateDialog if returning from auth with buyTicket param
  useEffect(() => {
    if (autoOpenHandled || !user || tickets.length === 0) return;
    const buyTicketId = searchParams.get("buyTicket");
    if (!buyTicketId) return;

    const ticket = tickets.find((t) => t.id === buyTicketId);
    if (ticket) {
      // Restore quantity filter if it was preserved
      const buyQty = searchParams.get("buyQty");
      const buyQtyNum = buyQty ? Number(buyQty) : NaN;
      if (buyQty && Number.isFinite(buyQtyNum) && buyQtyNum >= 2 && buyQtyNum <= 40) {
        setDesiredSeats(buyQty);
      }
      checkMembership().finally(() => {
        setFeeGateTicket(ticket);
      });
    }
    // Clean up the URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("buyTicket");
    newParams.delete("buyQty");
    setSearchParams(newParams, { replace: true });
    setAutoOpenHandled(true);
  }, [user, tickets, searchParams, autoOpenHandled, checkMembership, setSearchParams]);

  const openLightbox = (images: SeatImage[], startIndex: number) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
  };

  const processPayment = async (ticket: TicketInfo, includeFee: boolean, qty: number = 1) => {
    setBuyingTicketId(ticket.id);
    try {
      const totalAmount = ticket.price * qty;
      const feeAmount = includeFee ? Math.round(totalAmount * 0.13 * 100) / 100 : 0;
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          eventTitle: gameTitle ? expandTeamNames(gameTitle) : "Event Ticket",
          totalAmount,
          quantity: qty,
          tier: `Section ${ticket.section}${ticket.row_name ? `, Row ${ticket.row_name}` : ""}${ticket.seat_number && !ticket.hide_seat_numbers ? `, Seat${ticket.seat_number.includes("-") || ticket.seat_number.includes(",") ? "s" : ""} ${ticket.seat_number}` : ""}`,
          uberAdded: false,
          hotelAdded: false,
          flightAdded: false,
          serviceFee: feeAmount,
          venue: venueName || "",
          eventDate: eventDate || "",
          ticketId: ticket.id,
        },
      });
      if (error) throw error;
      if (data?.url) {
        redirectToStripeCheckout(data.url);
        return;
      }
      throw new Error("Checkout URL was not returned");
    } catch (err: any) {
      const message = await getEdgeFunctionErrorMessage(err, "Could not start checkout");
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setBuyingTicketId(null);
      setFeeGateTicket(null);
      setMemberCheckoutOverride(null);
    }
  };

  const handleBuy = async (ticket: TicketInfo) => {
    if (!user) {
      if (isMobile) {
        // Mobile: open auth sheet instead of redirecting
        setPendingBuyTicket(ticket);
        setShowAuthSheet(true);
        return;
      }
      // Desktop: redirect flow — include game ID so the correct game is re-selected
      const params = new URLSearchParams(searchParams);
      params.set("buyTicket", ticket.id);
      if (gameId) {
        params.set("game", gameId);
      }
      if (desiredSeats !== "any") {
        params.set("buyQty", desiredSeats);
      }
      const redirectPath = `${location.pathname}?${params.toString()}`;
      navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    await checkMembership();
    setMemberCheckoutOverride(isMember);
    setFeeGateTicket(ticket);
  };

  const handleAuthSuccess = () => {
    // After mobile auth succeeds, auto-open fee gate for the pending ticket
    if (pendingBuyTicket) {
      setTimeout(() => {
        setFeeGateTicket(pendingBuyTicket);
        setPendingBuyTicket(null);
      }, 300);
    }
  };

  const selectedSeatCount = desiredSeats === "any" ? null : Number(desiredSeats);

  const canFulfillSeatCount = (ticket: TicketInfo, seatCount: number | null) => {
    if (!seatCount) return true;
    const remaining = ticket.quantity - ticket.quantity_sold;
    // Odd remaining → must buy the full set
    if (remaining % 2 !== 0) return seatCount === remaining;
    // Even remaining → only even purchase sizes, up to remaining (never leave 1)
    if (seatCount % 2 !== 0) return false;
    return seatCount <= remaining;
  };

  const getQuantityHint = (ticket: TicketInfo): string => {
    const remaining = ticket.quantity - ticket.quantity_sold;
    if (remaining < 1) return "";
    if (remaining === 1) return "Sold as a single";
    if (remaining % 2 !== 0) return `Must buy all ${remaining} (no singles left behind)`;
    if (remaining === 2) return "Buy as a pair (2)";
    const evens: number[] = [];
    for (let n = 2; n <= remaining; n += 2) evens.push(n);
    return `Buy in pairs: ${evens.join(", ")}`;
  };

  // Derive available group sizes from current inventory.
  // Even remainings contribute even options (2, 4, 6, ...). Odd remainings contribute their exact full-set size.
  const seatCountSet = new Set<number>();
  let maxEvenRemaining = 0;
  tickets.forEach((t) => {
    const rem = t.quantity - t.quantity_sold;
    if (rem < 2) return;
    if (rem % 2 === 0) {
      maxEvenRemaining = Math.max(maxEvenRemaining, rem);
    } else {
      seatCountSet.add(rem); // odd full-set option
    }
  });
  for (let n = 2; n <= maxEvenRemaining; n += 2) seatCountSet.add(n);
  const seatCountOptions = Array.from(seatCountSet).sort((a, b) => a - b);

  // Check if aisle / row1 / accessible perks exist in current inventory
  const hasAisleTickets = tickets.some((t) => t.perks?.includes("aisle"));
  const hasRow1Tickets = tickets.some((t) => t.perks?.includes("row1") || t.row_name === "1");
  const hasAccessibleTickets = tickets.some((t) => t.perks?.includes("accessible"));

  const sectionFilteredTickets = selectedSection ? tickets.filter((t) => t.section === selectedSection) : tickets;
  const allTickets = sectionFilteredTickets
    .filter((ticket) => canFulfillSeatCount(ticket, selectedSeatCount))
    .filter((ticket) => !filterAisle || ticket.perks?.includes("aisle"))
    .filter((ticket) => !filterRow1 || ticket.perks?.includes("row1") || ticket.row_name === "1")
    .filter((ticket) => !filterAccessible || ticket.perks?.includes("accessible"));
  const featuredTickets = allTickets.filter((t) => !t.is_reseller_ticket);
  const resellerTickets = allTickets.filter((t) => t.is_reseller_ticket);

  const FeaturedTicketCard = ({ ticket }: { ticket: TicketInfo }) => {
    const images = seatImages[ticket.id] || [];
    const perks = ticket.perks || [];

    return (
      <div
        className="glass rounded-xl p-4 hover:border-primary/40 transition-all border-primary/20 cursor-pointer"
        onClick={() => handleBuy(ticket)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground">Section {ticket.section}</p>
              <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-semibold">No Fees</span>
              {isGiveaway && perks.includes("giveaway_guaranteed") && (
                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-[10px] font-semibold text-primary flex items-center gap-0.5">
                  <Gift className="h-2.5 w-2.5" /> Giveaway Guaranteed
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {ticket.row_name && `Row ${ticket.row_name}`}
              {!ticket.hide_seat_numbers && ticket.seat_number && ` · Seats ${ticket.seat_number}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{ticket.quantity - ticket.quantity_sold} available</p>
            <p className="text-[10px] text-primary/80 mt-0.5 font-medium">{getQuantityHint(ticket)}</p>
            {perks.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {perks.filter((p) => p !== "giveaway_guaranteed").map((p) => {
                  const info = PERK_LABELS[p];
                  return info ? (
                    <span key={p} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">{info.emoji} {info.label}</span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              {selectedSeatCount ? (
                <>
                  <p className="font-display text-xl font-bold text-foreground">${(ticket.price * selectedSeatCount).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">CAD</span></p>
                  <p className="text-[10px] text-muted-foreground">{selectedSeatCount} tickets × ${ticket.price}</p>
                </>
              ) : (
                <>
                  <p className="font-display text-xl font-bold text-foreground">${ticket.price} <span className="text-xs text-muted-foreground font-normal">CAD</span></p>
                  <p className="text-xs text-muted-foreground">per ticket</p>
                </>
              )}
              <p className="text-[10px] text-emerald-400 mt-0.5">Members enjoy LCC-included pricing</p>
              {ticket.face_value && ticket.face_value > 0 && (
                <p className="text-[9px] text-muted-foreground mt-0.5">Face value: ${ticket.face_value.toFixed(2)}</p>
              )}
            </div>
            <Button
              variant="hero"
              size="sm"
              className="animate-pulse-glow"
              onClick={(e) => { e.stopPropagation(); handleBuy(ticket); }}
              disabled={buyingTicketId === ticket.id}
            >
              {buyingTicketId === ticket.id ? "..." : "Buy Tickets"}
            </Button>
          </div>
        </div>
        {images.length > 0 ? (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Eye className="h-3 w-3 text-primary/70" />
              <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider">Seat View</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); openLightbox(images, idx); }}
                  className="relative group flex-shrink-0 rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all"
                >
                  <img src={img.image_url} alt={img.caption || "Seat view"} className="w-24 h-16 object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-0.5">
                      <span className="text-[9px] text-white/90 line-clamp-1">{img.caption}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <Camera className="h-3 w-3" />
            <span>No seat view photos yet</span>
          </div>
        )}
      </div>
    );
  };

  const CompactTicketCard = ({ ticket }: { ticket: TicketInfo }) => {
    const images = seatImages[ticket.id] || [];
    const isExpanded = expandedTicket === ticket.id;
    const perks = ticket.perks || [];

    return (
      <div className="glass rounded-lg transition-all hover:border-border/60">
        <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">Sec {ticket.section}</span>
                {ticket.row_name && <span className="text-xs text-muted-foreground">Row {ticket.row_name}</span>}
                {perks.length > 0 && <Star className="h-3 w-3 text-primary/60" />}
                {images.length > 0 && <Camera className="h-3 w-3 text-muted-foreground/60" />}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{ticket.quantity - ticket.quantity_sold} avail</span>
            <span className="text-[10px] text-primary/80 font-medium hidden sm:inline">· {getQuantityHint(ticket)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              {selectedSeatCount ? (
                <>
                  <span className="font-display text-sm font-bold text-foreground">${(ticket.price * selectedSeatCount).toLocaleString()} <span className="text-[9px] text-muted-foreground font-normal">CAD</span></span>
                  <p className="text-[9px] text-muted-foreground">{selectedSeatCount} × ${ticket.price}</p>
                </>
              ) : (
                <span className="font-display text-sm font-bold text-foreground">${ticket.price} <span className="text-[9px] text-muted-foreground font-normal">CAD</span></span>
              )}
              <p className="text-[9px] text-emerald-400">Members enjoy LCC-included pricing</p>
              {ticket.face_value && ticket.face_value > 0 && (
                <p className="text-[8px] text-muted-foreground">Face value: ${ticket.face_value.toFixed(2)}</p>
              )}
            </div>
            <Button
              variant="hero"
              size="sm"
              className="h-7 text-xs px-2.5 animate-pulse-glow"
              onClick={(e) => { e.stopPropagation(); handleBuy(ticket); }}
              disabled={buyingTicketId === ticket.id}
            >
              {buyingTicketId === ticket.id ? "..." : "Buy Tickets"}
            </Button>
            {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
        {isExpanded && (
          <div className="px-3 pb-3 pt-0 border-t border-border/50 animate-fade-in">
            <div className="flex flex-wrap gap-1 mt-2">
              {!ticket.hide_seat_numbers && ticket.seat_number && <span className="text-xs text-muted-foreground">Seats {ticket.seat_number}</span>}
              {perks.map((p) => {
                const info = PERK_LABELS[p];
                return info ? (<span key={p} className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-muted-foreground">{info.emoji} {info.label}</span>) : null;
              })}
            </div>
            {ticket.seat_notes && <p className="text-xs text-muted-foreground mt-1">{ticket.seat_notes}</p>}
            {images.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={(e) => { e.stopPropagation(); openLightbox(images, idx); }}
                    className="relative group flex-shrink-0 rounded overflow-hidden border border-border hover:border-primary/40 transition-all"
                  >
                    <img src={img.image_url} alt={img.caption || "Seat view"} className="w-20 h-14 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <Camera className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Mobile compact card: no expand needed, always shows Buy
  const MobileCompactCard = ({ ticket }: { ticket: TicketInfo }) => {
    const perks = ticket.perks || [];
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 glass rounded-lg border-border/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-foreground">Sec {ticket.section}</span>
            {ticket.row_name && <span className="text-xs text-muted-foreground">· Row {ticket.row_name}</span>}
            {perks.length > 0 && <Star className="h-3 w-3 text-primary/60" />}
          </div>
          <span className="text-[10px] text-muted-foreground">{ticket.quantity - ticket.quantity_sold} avail</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            {selectedSeatCount ? (
              <span className="font-display text-sm font-bold text-foreground">${(ticket.price * selectedSeatCount).toLocaleString()} <span className="text-[9px] text-muted-foreground font-normal">CAD</span></span>
            ) : (
              <span className="font-display text-sm font-bold text-foreground">${ticket.price} <span className="text-[9px] text-muted-foreground font-normal">CAD</span></span>
            )}
            <p className="text-[9px] text-emerald-400">No fees for members</p>
              {ticket.face_value && ticket.face_value > 0 && (
                <p className="text-[8px] text-muted-foreground">Face value: ${ticket.face_value.toFixed(2)}</p>
              )}
          </div>
          <Button
            variant="hero"
            size="sm"
            className="h-8 text-xs px-3 animate-pulse-glow"
            onClick={() => handleBuy(ticket)}
            disabled={buyingTicketId === ticket.id}
          >
            {buyingTicketId === ticket.id ? "..." : "Buy"}
          </Button>
        </div>
      </div>
    );
  };

  // Sticky bar: track filter bar visibility on mobile
  useEffect(() => {
    if (!isMobile || !filterBarRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(filterBarRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  const cheapestPrice = allTickets.length > 0 ? Math.min(...allTickets.map(t => t.price)) : null;
  const featuredTicketCount = featuredTickets.reduce(
    (sum, ticket) => sum + Math.max(0, ticket.quantity - ticket.quantity_sold),
    0,
  );
  const resellerTicketCount = resellerTickets.reduce(
    (sum, ticket) => sum + Math.max(0, ticket.quantity - ticket.quantity_sold),
    0,
  );

  return (
    <div id="ticket-listings">
      {selectedSection && (
        <button onClick={() => setSelectedSection(null)} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">← All Sections</button>
      )}
      {isGiveaway && giveawayItem && (
        <div className="rounded-xl p-4 mb-4 flex items-center gap-3 border-2 border-primary/50 bg-primary/10 shadow-lg shadow-primary/15 animate-pulse-glow">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Gift className="h-5 w-5 text-primary animate-bounce" />
          </div>
          <div>
            <p className="text-sm font-bold text-primary uppercase tracking-wide">🎁 Giveaway Game!</p>
            <p className="text-sm text-foreground font-medium">{giveawayItem}</p>
          </div>
        </div>
      )}

      {(hasAisleTickets || hasRow1Tickets || hasAccessibleTickets) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Filter:</span>
          {hasRow1Tickets && (
            <button
              onClick={() => setFilterRow1((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filterRow1
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
              }`}
            >
              🥇 Row 1
            </button>
          )}
          {hasAisleTickets && (
            <button
              onClick={() => setFilterAisle((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filterAisle
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
              }`}
            >
              🪑 Aisle Seats
            </button>
          )}
          {hasAccessibleTickets && (
            <button
              onClick={() => setFilterAccessible((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                filterAccessible
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
              }`}
            >
              ♿ Accessible
            </button>
          )}
        </div>
      )}

      <div ref={filterBarRef} className="mb-5 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
              🎟️ Quantity of Tickets
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedSeatCount
                ? `Showing listings with ${selectedSeatCount} ticket${selectedSeatCount > 1 ? "s" : ""} available.`
                : "Select how many tickets you need to filter results."}
            </p>
          </div>
          <Select value={desiredSeats} onValueChange={setDesiredSeats}>
            <SelectTrigger className="w-[200px] h-10 bg-card border-primary/30 font-semibold text-foreground">
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Quantities</SelectItem>
              {seatCountOptions.map((count) => (
                <SelectItem key={count} value={String(count)}>
                  {count === 3 ? "3 Tickets (full set)" : `${count} Tickets`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <h2 id="featured-tickets" className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2 scroll-mt-24">
        <span>⭐ Featured Tickets</span>
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
          ({featuredTicketCount})
        </span>
      </h2>
      {featuredTickets.length > 0 ? (
        <div className="space-y-3 mb-6">{featuredTickets.map((t) => <FeaturedTicketCard key={t.id} ticket={t} />)}</div>
      ) : (
        <p className="text-muted-foreground text-sm mb-6">No featured tickets for this selection.</p>
      )}
      <h2 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
        <span>Tickets ({resellerTicketCount})</span>
      </h2>
      {resellerTickets.length > 0 ? (
        <div className="space-y-1">
          {resellerTickets.map((t) => isMobile ? <MobileCompactCard key={t.id} ticket={t} /> : <CompactTicketCard key={t.id} ticket={t} />)}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No other tickets for this selection.</p>
      )}
      {feeGateTicket && (
        <FeeGateDialog
          open={!!feeGateTicket}
          onOpenChange={(open) => {
            if (!open) {
              setFeeGateTicket(null);
              setMemberCheckoutOverride(null);
            }
          }}
          ticketPrice={feeGateTicket.price}
          section={feeGateTicket.section}
          rowName={feeGateTicket.row_name}
          ticketId={feeGateTicket.id}
          onProceedWithFees={(qty) => processPayment(feeGateTicket, true, qty)}
          onProceedNoFees={(qty) => processPayment(feeGateTicket, false, qty)}
          loading={buyingTicketId === feeGateTicket.id}
          venueName={venueName}
          gameTitle={gameTitle}
          eventDate={eventDate}
          isMember={memberCheckoutOverride ?? isMember}
          isAdmin={isAdmin}
          availableQuantity={feeGateTicket.quantity - feeGateTicket.quantity_sold}
          splitType={feeGateTicket.split_type}
          preferredQuantity={desiredSeats !== "any" ? Number(desiredSeats) : undefined}
          faceValue={feeGateTicket.face_value}
        />
      )}

      {/* Seat View Lightbox */}
      <Dialog open={lightboxImages.length > 0} onOpenChange={(open) => { if (!open) setLightboxImages([]); }}>
        <DialogContent className="max-w-3xl p-0 bg-black/95 border-border overflow-hidden">
          {lightboxImages.length > 0 && (
            <div className="relative">
              <img
                src={lightboxImages[lightboxIndex].image_url}
                alt={lightboxImages[lightboxIndex].caption || "Seat view"}
                className="w-full max-h-[75vh] object-contain"
              />

              {/* Caption overlay */}
              {lightboxImages[lightboxIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
                  <p className="text-white text-sm">{lightboxImages[lightboxIndex].caption}</p>
                </div>
              )}

              {/* Navigation arrows */}
              {lightboxImages.length > 1 && (
                <>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Counter */}
              {lightboxImages.length > 1 && (
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {lightboxIndex + 1} / {lightboxImages.length}
                </div>
              )}

              {/* Thumbnail strip */}
              {lightboxImages.length > 1 && (
                <div className="flex gap-2 p-3 justify-center bg-black/80">
                  {lightboxImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setLightboxIndex(idx)}
                      className={`w-14 h-10 rounded overflow-hidden border-2 transition-all ${
                        idx === lightboxIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile auth sheet */}
      <MobileAuthSheet
        open={showAuthSheet}
        onOpenChange={(open) => {
          setShowAuthSheet(open);
          if (!open) setPendingBuyTicket(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Mobile sticky buy bar */}
      {isMobile && showStickyBar && cheapestPrice !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-2.5 flex items-center justify-between safe-area-inset-bottom">
          <div>
            <p className="text-xs text-muted-foreground">Tickets from</p>
            <p className="text-lg font-display font-bold text-foreground">${cheapestPrice} <span className="text-xs text-muted-foreground font-normal">CAD</span></p>
          </div>
          <Button
            variant="hero"
            size="sm"
            className="animate-pulse-glow h-9 px-5"
            onClick={() => filterBarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            View Tickets
          </Button>
        </div>
      )}
    </div>
  );
};

export default TicketListings;
