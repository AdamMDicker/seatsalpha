import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Ticket, Clock, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const STANDARD_LEAGUES = ["NHL", "NFL", "MLB", "NBA", "MLS", "CFL", "WNBA"];
const ALL_OPTIONS = [...STANDARD_LEAGUES, "Other"];

interface SeatLocation {
  section: string;
  row: string;
  seatCount: string;
  lowestSeat: string;
}

interface SportEntry {
  id: string;
  league: string;
  otherDetails: string;
  locationCount: number;
  seats: SeatLocation[];
  expanded: boolean;
}

const emptySeat = (): SeatLocation => ({ section: "", row: "", seatCount: "", lowestSeat: "" });
let entryIdCounter = 0;
const newEntry = (): SportEntry => ({
  id: `entry-${++entryIdCounter}`,
  league: "",
  otherDetails: "",
  locationCount: 0,
  seats: [],
  expanded: false,
});

const SellerApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);

  // Step 0: STH vs casual
  const [sellerPath, setSellerPath] = useState<"sth" | "casual" | null>(null);

  // Section A
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isRegisteredCompany, setIsRegisteredCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [corporationNumber, setCorporationNumber] = useState("");
  const [taxCollectionNumber, setTaxCollectionNumber] = useState("");

  // Section B: sport entries
  const [sportEntries, setSportEntries] = useState<SportEntry[]>([newEntry()]);

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const usedLeagues = sportEntries.map((e) => e.league).filter(Boolean);

  const availableOptions = (currentLeague: string) =>
    ALL_OPTIONS.filter((opt) => opt === currentLeague || !usedLeagues.includes(opt));

  const updateEntry = (id: string, patch: Partial<SportEntry>) => {
    setSportEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const removeEntry = (id: string) => {
    setSportEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addEntry = () => {
    setSportEntries((prev) => [...prev, newEntry()]);
  };

  const setEntryLocationCount = (id: string, count: number) => {
    setSportEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const existing = e.seats;
        const arr: SeatLocation[] = [];
        for (let i = 0; i < count; i++) {
          arr.push(existing[i] || emptySeat());
        }
        return { ...e, locationCount: count, seats: arr, expanded: true };
      })
    );
  };

  const updateSeatField = (entryId: string, idx: number, field: keyof SeatLocation, value: string) => {
    setSportEntries((prev) =>
      prev.map((e) => {
        if (e.id !== entryId) return e;
        const arr = [...e.seats];
        arr[idx] = { ...arr[idx], [field]: value };
        return { ...e, seats: arr };
      })
    );
  };

  const hasOther = sportEntries.some((e) => e.league === "Other");

  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim() || !email.trim())
      return "Please fill in all required fields (First Name, Last Name, Email).";
    if (isRegisteredCompany && !companyName.trim())
      return "Company Name is required for registered companies.";

    const filledEntries = sportEntries.filter((e) => e.league);
    if (filledEntries.length === 0) return "Please select at least one sport.";

    for (const entry of filledEntries) {
      if (entry.league === "Other" && !entry.otherDetails.trim()) {
        return 'Please describe your sport/event type for the "Other" selection.';
      }
      if (entry.locationCount === 0)
        return `Please select how many seat locations you have for ${entry.league}.`;
      for (let i = 0; i < entry.locationCount; i++) {
        const s = entry.seats[i];
        if (!s || !s.section.trim() || !s.row.trim() || !s.seatCount.trim() || !s.lowestSeat.trim()) {
          return `Please fill in all fields for ${entry.league} — Location ${i + 1}.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Sign in required", description: "Please create an account first, then come back to apply." });
      return;
    }

    setApplying(true);
    try {
      // Auto-approve if standard leagues only (no "Other")
      const shouldAutoApprove = !hasOther;

      const { data, error } = await supabase
        .from("resellers")
        .insert({
          user_id: user.id,
          business_name: isRegisteredCompany ? companyName.trim() : `${firstName.trim()} ${lastName.trim()}`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || null,
          email: email.trim(),
          is_registered_company: isRegisteredCompany,
          corporation_number: corporationNumber.trim() || null,
          tax_collection_number: taxCollectionNumber.trim() || null,
          seller_type: "sth",
        } as any)
        .select("id")
        .single();

      if (error) throw error;

      // Auto-approve standard sports via secure RPC
      if (shouldAutoApprove) {
        const { error: approveError } = await supabase.rpc("auto_approve_reseller", {
          _reseller_id: data.id,
        });
        if (approveError) throw approveError;
      }

      if (error) throw error;

      // Insert seat locations
      const seatRows: any[] = [];
      for (const entry of sportEntries) {
        if (!entry.league) continue;
        const leagueName = entry.league === "Other" ? `Other: ${entry.otherDetails.trim()}` : entry.league;
        for (let i = 0; i < entry.locationCount; i++) {
          const s = entry.seats[i];
          seatRows.push({
            reseller_id: data.id,
            league: leagueName,
            section: s.section.trim(),
            row_name: s.row.trim(),
            seat_count: parseInt(s.seatCount),
            lowest_seat: s.lowestSeat.trim(),
          });
        }
      }

      if (seatRows.length > 0) {
        const { error: seatError } = await supabase.from("reseller_application_seats").insert(seatRows);
        if (seatError) throw seatError;
      }

      if (shouldAutoApprove) {
        toast({ title: "Application approved!", description: "Proceed to review and sign the Seller Agreement." });
        // Force a reload so the dashboard picks up the new status
        window.location.reload();
      } else {
        toast({ title: "Application submitted!", description: "Our team will review your application and follow up shortly." });
        window.location.reload();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  // Step 0: Seller type selector
  if (sellerPath === null) {
    return (
      <div id="apply" className="max-w-2xl mx-auto">
        <div className="glass rounded-xl p-8">
          <h2 className="font-display text-2xl font-bold text-center mb-2">How Would You Like to Sell?</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Choose the option that best describes you.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setSellerPath("sth")}
              className="glass rounded-xl p-8 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group cursor-pointer border-2 border-transparent"
            >
              <Ticket className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">Season Ticket Holder</h3>
              <p className="text-sm text-muted-foreground">
                I have season tickets and want to list games I can't attend.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSellerPath("casual")}
              className="glass rounded-xl p-8 text-center hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group cursor-pointer border-2 border-transparent"
            >
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">I Want to Sell a Few Tickets</h3>
              <p className="text-sm text-muted-foreground">
                I have a few tickets to sell but I'm not a season ticket holder.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Casual seller: Coming Soon
  if (sellerPath === "casual") {
    const handleNotifySignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!casualEmail.trim()) return;
      setCasualSubmitting(true);
      try {
        const { error } = await supabase
          .from("newsletter_subscribers")
          .insert({ email: casualEmail.trim().toLowerCase() });
        if (error) {
          if (error.code === "23505") {
            toast({ title: "You're already on the list!", description: "We'll notify you when casual selling launches." });
          } else {
            throw error;
          }
        } else {
          toast({ title: "You're on the list!", description: "We'll email you as soon as casual selling is available." });
        }
        setCasualSigned(true);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setCasualSubmitting(false);
      }
    };

    return (
      <div id="apply" className="max-w-lg mx-auto">
        <div className="glass rounded-xl p-8 text-center space-y-4">
          <Clock className="h-12 w-12 text-primary mx-auto" />
          <h2 className="font-display text-2xl font-bold">Coming Soon!</h2>
          <p className="text-muted-foreground">
            Thanks for your interest! We're building tools for casual sellers so you can list individual tickets quickly and easily.
          </p>

          {casualSigned ? (
            <div className="bg-primary/10 rounded-lg p-4 space-y-1">
              <p className="text-sm font-medium text-foreground">🎉 You're on the list!</p>
              <p className="text-xs text-muted-foreground">We'll send you an email when casual selling launches.</p>
            </div>
          ) : (
            <form onSubmit={handleNotifySignup} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                value={casualEmail}
                onChange={(e) => setCasualEmail(e.target.value)}
                placeholder="your@email.com"
                required
                maxLength={100}
                className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button type="submit" variant="hero" disabled={casualSubmitting}>
                {casualSubmitting ? "..." : "Notify Me"}
              </Button>
            </form>
          )}

          <Button variant="outline" onClick={() => setSellerPath(null)}>
            ← Go Back
          </Button>
        </div>
      </div>
    );
  }

  // STH application form
  return (
    <div id="apply" className="max-w-2xl mx-auto">
      <div className="glass rounded-xl p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-2xl font-bold">Season Ticket Holder Application</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          {user
            ? "Fill out the form below. Standard sports are auto-approved."
            : "Create an account first, then fill out the form below."}
        </p>
        <button
          type="button"
          onClick={() => setSellerPath(null)}
          className="text-xs text-primary hover:underline mb-6 inline-block"
        >
          ← Back to selection
        </button>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section A: Personal & Business Info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">Personal & Business Info</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">First Name *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required maxLength={50} className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Last Name *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" required maxLength={50} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(416) 555-0123" maxLength={20} className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required maxLength={100} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Switch checked={isRegisteredCompany} onCheckedChange={setIsRegisteredCompany} />
              <label className="text-sm text-foreground font-medium">Are you a registered company?</label>
            </div>

            {isRegisteredCompany && (
              <div className="space-y-4 pl-1 border-l-2 border-primary/20 ml-2 p-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Company Name *</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your ticket company" required maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Corporation Number <span className="text-muted-foreground/60">(optional)</span></label>
                  <input value={corporationNumber} onChange={(e) => setCorporationNumber(e.target.value)} placeholder="e.g. 123456789" maxLength={50} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Tax Collection Number (HST/GST) <span className="text-muted-foreground/60">(optional)</span></label>
                  <input value={taxCollectionNumber} onChange={(e) => setTaxCollectionNumber(e.target.value)} placeholder="e.g. 123456789RT0001" maxLength={50} className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* Section B: Sport Selection */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">Sport Selection & Seat Inventory</h3>
            <p className="text-sm text-muted-foreground">Add each sport you hold season tickets for.</p>

            {sportEntries.map((entry, entryIndex) => (
              <div key={entry.id} className="glass rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select
                      value={entry.league}
                      onValueChange={(val) => updateEntry(entry.id, { league: val, otherDetails: val !== "Other" ? "" : entry.otherDetails })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sport..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOptions(entry.league).map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {sportEntries.length > 1 && (
                    <button type="button" onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* "Other" free-text */}
                {entry.league === "Other" && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Tell us more — what sport or event type? *</label>
                    <Textarea
                      value={entry.otherDetails}
                      onChange={(e) => updateEntry(entry.id, { otherDetails: e.target.value })}
                      placeholder="e.g. Lacrosse — Toronto Rock season tickets"
                      maxLength={500}
                      className="resize-none"
                    />
                  </div>
                )}

                {/* Seat locations (show when a league is selected) */}
                {entry.league && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground whitespace-nowrap">Seat locations:</label>
                      <Select
                        value={entry.locationCount > 0 ? entry.locationCount.toString() : ""}
                        onValueChange={(val) => setEntryLocationCount(entry.id, parseInt(val))}
                      >
                        <SelectTrigger className="w-20 h-9">
                          <SelectValue placeholder="#" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {entry.locationCount > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateEntry(entry.id, { expanded: !entry.expanded })}
                          className="text-xs text-primary flex items-center gap-1 hover:underline"
                        >
                          {entry.expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {entry.expanded ? "Collapse" : "Expand"} seat details
                        </button>

                        {entry.expanded && (
                          <div className="space-y-3">
                            {entry.seats.map((seat, idx) => (
                              <div key={idx} className="bg-secondary/50 rounded-lg p-3 space-y-3">
                                <span className="text-xs font-medium text-muted-foreground">Location {idx + 1}</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Section *</label>
                                    <input
                                      value={seat.section}
                                      onChange={(e) => updateSeatField(entry.id, idx, "section", e.target.value)}
                                      placeholder="e.g. 108"
                                      maxLength={20}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Row *</label>
                                    <input
                                      value={seat.row}
                                      onChange={(e) => updateSeatField(entry.id, idx, "row", e.target.value)}
                                      placeholder="e.g. 12"
                                      maxLength={10}
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block"># of Seats *</label>
                                    <input
                                      type="number"
                                      value={seat.seatCount}
                                      onChange={(e) => updateSeatField(entry.id, idx, "seatCount", e.target.value)}
                                      placeholder="e.g. 4"
                                      min="1"
                                      max="100"
                                      className={inputClass}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Lowest Seat # *</label>
                                    <input
                                      value={seat.lowestSeat}
                                      onChange={(e) => updateSeatField(entry.id, idx, "lowestSeat", e.target.value)}
                                      placeholder="e.g. 1"
                                      maxLength={10}
                                      className={inputClass}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Add another sport */}
            {usedLeagues.length < ALL_OPTIONS.length && (
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" /> Add Another Sport
              </button>
            )}
          </div>

          {/* Submit */}
          {!user && (
            <p className="text-xs text-gold text-center">
              You'll need to <a href="/auth" className="underline hover:text-primary">create an account</a> before submitting your application.
            </p>
          )}

          {hasOther && (
            <p className="text-xs text-muted-foreground text-center bg-secondary/50 rounded-lg p-3">
              Your application includes a non-standard sport. Our team will review it and follow up shortly.
            </p>
          )}

          <Button variant="hero" className="w-full" size="lg" disabled={applying || !user}>
            {applying ? "Submitting..." : hasOther ? "Submit for Review" : "Submit & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SellerApplicationForm;
