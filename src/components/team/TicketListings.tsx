import { useState, useEffect } from "react";
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
import FeeGateDialog from "./FeeGateDialog";

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
  venueName?: string;
  eventDate?: string;
}

const PERK_LABELS: Record<string, { label: string; emoji: string }> = {
  aisle: { label: "Aisle Seat", emoji: "🪑" },
  row1: { label: "Row 1", emoji: "🥇" },
  food: { label: "Food Included", emoji: "🍔" },
  drinks: { label: "Drinks Included", emoji: "🍺" },
  lounge: { label: "Lounge Access", emoji: "🛋️" },
  parking: { label: "Parking Included", emoji: "🅿️" },
  giveaway_guaranteed: { label: "Giveaway Guaranteed", emoji: "🎁" },
};

const TicketListings = ({ tickets, selectedSection, setSelectedSection, isGiveaway, giveawayItem, gameTitle, venueName, eventDate }: TicketListingsProps) => {
  const [seatImages, setSeatImages] = useState<Record<string, SeatImage[]>>({});
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [buyingTicketId, setBuyingTicketId] = useState<string | null>(null);
  const [feeGateTicket, setFeeGateTicket] = useState<TicketInfo | null>(null);
  const [lightboxImages, setLightboxImages] = useState<SeatImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [desiredSeats, setDesiredSeats] = useState("any");
  const { user, isMember } = useAuth();
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
          tier: `Section ${ticket.section}${ticket.row_name ? ` Row ${ticket.row_name}` : ""}`,
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
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setBuyingTicketId(null);
      setFeeGateTicket(null);
    }
  };

  const handleBuy = (ticket: TicketInfo) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    setFeeGateTicket(ticket);
  };

  const allTickets = selectedSection ? tickets.filter((t) => t.section === selectedSection) : tickets;
  const featuredTickets = allTickets.filter((t) => !t.is_reseller_ticket).slice(0, 4);
  const resellerTickets = allTickets.filter((t) => t.is_reseller_ticket);

  const FeaturedTicketCard = ({ ticket }: { ticket: TicketInfo }) => {
    const images = seatImages[ticket.id] || [];
    const perks = ticket.perks || [];

    return (
      <div className="glass rounded-xl p-4 hover:border-primary/40 transition-all border-primary/20">
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
              <p className="font-display text-xl font-bold text-foreground">${ticket.price}</p>
              <p className="text-xs text-muted-foreground">per ticket</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">Members enjoy HST-included pricing</p>
            </div>
            <Button
              variant="hero"
              size="sm"
              className="animate-pulse-glow"
              onClick={() => handleBuy(ticket)}
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
                  onClick={() => openLightbox(images, idx)}
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
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-display text-sm font-bold text-foreground">${ticket.price}</span>
              <p className="text-[9px] text-emerald-400">Members enjoy HST-included pricing</p>
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

  return (
    <div>
      {selectedSection && (
        <button onClick={() => setSelectedSection(null)} className="text-sm text-primary hover:underline mb-4 flex items-center gap-1">← All Sections</button>
      )}
      {isGiveaway && giveawayItem && (
        <div className="glass rounded-xl p-3 mb-4 flex items-center gap-2 border-primary/20 bg-primary/5">
          <Gift className="h-4 w-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-primary">Giveaway Game!</p>
            <p className="text-xs text-muted-foreground">{giveawayItem}</p>
          </div>
        </div>
      )}
      <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">⭐ Featured Tickets</h2>
      {featuredTickets.length > 0 ? (
        <div className="space-y-3 mb-6">{featuredTickets.map((t) => <FeaturedTicketCard key={t.id} ticket={t} />)}</div>
      ) : (
        <p className="text-muted-foreground text-sm mb-6">No featured tickets for this selection.</p>
      )}
      <h2 className="font-display text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
        <span>Tickets ({resellerTickets.length})</span>
      </h2>
      {resellerTickets.length > 0 ? (
        <div className="space-y-1">{resellerTickets.map((t) => <CompactTicketCard key={t.id} ticket={t} />)}</div>
      ) : (
        <p className="text-muted-foreground text-sm">No other tickets for this selection.</p>
      )}
      {feeGateTicket && (
        <FeeGateDialog
          open={!!feeGateTicket}
          onOpenChange={(open) => { if (!open) setFeeGateTicket(null); }}
          ticketPrice={feeGateTicket.price}
          section={feeGateTicket.section}
          rowName={feeGateTicket.row_name}
          onProceedWithFees={(qty) => processPayment(feeGateTicket, true, qty)}
          onProceedNoFees={(qty) => processPayment(feeGateTicket, false, qty)}
          loading={buyingTicketId === feeGateTicket.id}
          venueName={venueName}
          gameTitle={gameTitle}
          eventDate={eventDate}
          isMember={isMember}
          availableQuantity={feeGateTicket.quantity - feeGateTicket.quantity_sold}
          splitType={feeGateTicket.split_type}
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
    </div>
  );
};

export default TicketListings;
