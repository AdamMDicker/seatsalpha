import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface ContactInfoGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onComplete: () => void;
}

const schema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+\d\s().-]+$/, "Invalid phone number"),
  address_line1: z.string().trim().min(3, "Street address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  province: z.string().trim().min(2, "Province is required").max(50),
  postal_code: z
    .string()
    .trim()
    .min(3, "Postal code is required")
    .max(15)
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid postal code"),
});

const ContactInfoGate = ({ open, onOpenChange, userId, onComplete }: ContactInfoGateProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    address_line1: "",
    city: "",
    province: "",
    postal_code: "",
  });

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("phone, address_line1, city, province, postal_code")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            phone: data.phone || "",
            address_line1: data.address_line1 || "",
            city: data.city || "",
            province: data.province || "",
            postal_code: data.postal_code || "",
          });
        }
        setLoading(false);
      });
  }, [open, userId]);

  const handleSave = async () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      toast({
        title: "Please complete all fields",
        description: result.error.issues[0]?.message || "Invalid input",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(result.data)
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Contact & Billing Info Required</DialogTitle>
          <DialogDescription>
            We need your phone number and billing address to complete your purchase. This is used for
            order confirmation, ticket delivery, and fraud prevention.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone">Phone number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(416) 555-0123"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="address_line1">Street address *</Label>
              <Input
                id="address_line1"
                placeholder="123 Main St, Apt 4B"
                value={form.address_line1}
                onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))}
                maxLength={200}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Toronto"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  placeholder="ON"
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  maxLength={50}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="postal_code">Postal code *</Label>
              <Input
                id="postal_code"
                placeholder="M5V 3A8"
                value={form.postal_code}
                onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                maxLength={15}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} variant="hero" className="w-full">
              {saving ? "Saving…" : "Save & Continue to Checkout"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactInfoGate;
