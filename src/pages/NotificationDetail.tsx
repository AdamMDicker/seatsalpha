import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, CheckCircle, Package, DollarSign, MapPin, Calendar, Armchair } from "lucide-react";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

const NotificationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (data) {
        setNotification(data as Notification);
        // Mark as read
        if (!data.is_read) {
          await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [user, id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!notification) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Notification not found.</p>
          <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const meta = notification.metadata || {};
  const isBuyer = notification.type === "purchase_buyer";
  const isSeller = notification.type === "purchase_seller";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
          </Button>
        </div>

        {/* Printable content */}
        <div ref={printRef} id="print-area" className="glass rounded-2xl p-6 md:p-8 border border-border">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className={`p-2.5 rounded-xl ${isBuyer ? "bg-emerald-500/10" : isSeller ? "bg-primary/10" : "bg-secondary"}`}>
              {isBuyer ? (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              ) : isSeller ? (
                <DollarSign className="h-6 w-6 text-primary" />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">{notification.title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(notification.created_at), "EEEE, MMMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>

          {/* Body */}
          <p className="text-sm text-foreground/90 leading-relaxed mb-6 whitespace-pre-line">{notification.body}</p>

          {/* Details card */}
          {(meta.event_title || meta.venue || meta.tier) && (
            <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Details</h2>
              
              {meta.event_title && (
                <div className="flex items-start gap-2.5">
                  <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Event</p>
                    <p className="text-sm font-medium text-foreground">{meta.event_title}</p>
                  </div>
                </div>
              )}

              {meta.event_date && (
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium text-foreground">{meta.event_date}</p>
                  </div>
                </div>
              )}

              {meta.venue && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="text-sm font-medium text-foreground">{meta.venue}</p>
                  </div>
                </div>
              )}

              {meta.tier && (
                <div className="flex items-start gap-2.5">
                  <Armchair className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Seats</p>
                    <p className="text-sm font-medium text-foreground">{meta.tier}</p>
                  </div>
                </div>
              )}

              {meta.total_amount && (
                <div className="flex items-start gap-2.5">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium text-foreground">${Number(meta.total_amount).toFixed(2)} CAD</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer branding for print */}
          <div className="mt-8 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">seats.ca — Your Trusted Ticket Marketplace</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">All sales are final. Contact support@seats.ca for assistance.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationDetail;
