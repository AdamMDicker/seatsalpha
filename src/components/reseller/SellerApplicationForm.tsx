import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

const LEAGUES = ["NHL", "NFL", "MLB", "NBA", "MLS", "CFL", "WNBA"];

interface SeatLocation {
  section: string;
  row: string;
  seatCount: string;
  lowestSeat: string;
}

const emptySeat = (): SeatLocation => ({ section: "", row: "", seatCount: "", lowestSeat: "" });

const SellerApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);

  // Section A
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isRegisteredCompany, setIsRegisteredCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [corporationNumber, setCorporationNumber] = useState("");
  const [taxCollectionNumber, setTaxCollectionNumber] = useState("");

  // Section B
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [locationCounts, setLocationCounts] = useState<Record<string, number>>({});
  const [seatLocations, setSeatLocations] = useState<Record<string, SeatLocation[]>>({});
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({});

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const toggleLeague = (league: string) => {
    setSelectedLeagues((prev) => {
      if (prev.includes(league)) {
        // Remove league data
        const next = prev.filter((l) => l !== league);
        const newCounts = { ...locationCounts };
        const newSeats = { ...seatLocations };
        delete newCounts[league];
        delete newSeats[league];
        setLocationCounts(newCounts);
        setSeatLocations(newSeats);
        return next;
      }
      return [...prev, league];
    });
  };

  const setLocationCount = (league: string, count: number) => {
    setLocationCounts((prev) => ({ ...prev, [league]: count }));
    setSeatLocations((prev) => {
      const existing = prev[league] || [];
      const arr: SeatLocation[] = [];
      for (let i = 0; i < count; i++) {
        arr.push(existing[i] || emptySeat());
      }
      return { ...prev, [league]: arr };
    });
    setExpandedLeagues((prev) => ({ ...prev, [league]: true }));
  };

  const updateSeatField = (league: string, idx: number, field: keyof SeatLocation, value: string) => {
    setSeatLocations((prev) => {
      const arr = [...(prev[league] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [league]: arr };
    });
  };

  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return "Please fill in all required fields (First Name, Last Name, Email).";
    if (isRegisteredCompany && !companyName.trim()) return "Company Name is required for registered companies.";
    if (selectedLeagues.length === 0) return "Please select at least one sport.";
    for (const league of selectedLeagues) {
      const count = locationCounts[league] || 0;
      if (count === 0) return `Please select how many seat locations you have for ${league}.`;
      const seats = seatLocations[league] || [];
      for (let i = 0; i < count; i++) {
        const s = seats[i];
        if (!s || !s.section.trim() || !s.row.trim() || !s.seatCount.trim() || !s.lowestSeat.trim()) {
          return `Please fill in all fields for ${league} — Location ${i + 1}.`;
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
        } as any)
        .select("id")
        .single();

      if (error) throw error;

      // Insert seat locations
      const seatRows: any[] = [];
      for (const league of selectedLeagues) {
        const seats = seatLocations[league] || [];
        const count = locationCounts[league] || 0;
        for (let i = 0; i < count; i++) {
          const s = seats[i];
          seatRows.push({
            reseller_id: data.id,
            league,
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

      toast({ title: "Application submitted!", description: "Our team will review your application and get back to you." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div id="apply" className="max-w-2xl mx-auto">
      <div className="glass rounded-xl p-8">
        <h2 className="font-display text-2xl font-bold text-center mb-2">Apply to Become a Seller</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          {user
            ? "Fill out the form below and our team will review your application."
            : "Create an account first, then fill out the form below."}
        </p>

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

            {/* Registered company toggle */}
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

          {/* Section B: Sport Selection & Seat Inventory */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground border-b border-border pb-2">Sport Selection & Seat Inventory</h3>
            <p className="text-sm text-muted-foreground">Select the sports you want to sell tickets for, then tell us about your seat locations.</p>

            {/* League checkboxes */}
            <div className="flex flex-wrap gap-3">
              {LEAGUES.map((league) => (
                <label key={league} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedLeagues.includes(league)}
                    onCheckedChange={() => toggleLeague(league)}
                  />
                  <span className="text-sm font-medium text-foreground">{league}</span>
                </label>
              ))}
            </div>

            {/* Per-league seat location cards */}
            {selectedLeagues.map((league) => (
              <div key={league} className="glass rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-foreground">{league}</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground whitespace-nowrap">Seat locations:</label>
                    <Select
                      value={locationCounts[league]?.toString() || ""}
                      onValueChange={(val) => setLocationCount(league, parseInt(val))}
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
                </div>

                {(locationCounts[league] || 0) > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedLeagues((prev) => ({ ...prev, [league]: !prev[league] }))}
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      {expandedLeagues[league] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {expandedLeagues[league] ? "Collapse" : "Expand"} seat details
                    </button>

                    {expandedLeagues[league] && (
                      <div className="space-y-3">
                        {(seatLocations[league] || []).map((seat, idx) => (
                          <div key={idx} className="bg-secondary/50 rounded-lg p-3 space-y-3">
                            <span className="text-xs font-medium text-muted-foreground">Location {idx + 1}</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Section *</label>
                                <input
                                  value={seat.section}
                                  onChange={(e) => updateSeatField(league, idx, "section", e.target.value)}
                                  placeholder="e.g. 108"
                                  maxLength={20}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Row *</label>
                                <input
                                  value={seat.row}
                                  onChange={(e) => updateSeatField(league, idx, "row", e.target.value)}
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
                                  onChange={(e) => updateSeatField(league, idx, "seatCount", e.target.value)}
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
                                  onChange={(e) => updateSeatField(league, idx, "lowestSeat", e.target.value)}
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
              </div>
            ))}
          </div>

          {/* Section C: Submit */}
          {!user && (
            <p className="text-xs text-gold text-center">
              You'll need to <a href="/auth" className="underline hover:text-primary">create an account</a> before submitting your application.
            </p>
          )}
          <Button variant="hero" className="w-full" size="lg" disabled={applying || !user}>
            {applying ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SellerApplicationForm;
