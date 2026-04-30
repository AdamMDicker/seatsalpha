import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, MapPin, Phone, Receipt, Eye, EyeOff, CheckCircle } from "lucide-react";

const Account = () => {
  const { user, isLoading, isMember, membershipEnd } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    province: "",
    postal_code: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, address_line1, city, province, postal_code")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            address_line1: data.address_line1 || "",
            city: data.city || "",
            province: data.province || "",
            postal_code: data.postal_code || "",
          });
        }
        setProfileLoading(false);
      });
  }, [user]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/auth?redirect=/account" replace />;

  const handleProfileSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, ...profile }, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your information has been saved." });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPasswordSuccess(true);
      setPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display text-2xl font-bold mb-1">My Account</h1>
        <p className="text-sm text-muted-foreground mb-8">{user.email}</p>

        {/* Membership Status */}
        <Card className="bg-card border-primary/20 mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Membership Status</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isMember
                    ? `Active — expires ${membershipEnd ? new Date(membershipEnd).toLocaleDateString("en-CA") : "N/A"}`
                    : "No active membership"}
                </p>
              </div>
              {!isMember && (
                <Link to="/membership">
                  <Button variant="hero" size="sm">Join Now</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card className="bg-card border-primary/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileLoading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
            ) : (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(416) 555-1234"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </Label>
                  <Input
                    value={profile.address_line1}
                    onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                    placeholder="Street address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      placeholder="Toronto"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Province</Label>
                    <Input
                      value={profile.province}
                      onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                      placeholder="ON"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Postal Code</Label>
                    <Input
                      value={profile.postal_code}
                      onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                      placeholder="M5V 1J2"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button variant="hero" onClick={handleProfileSave} disabled={saving} className="w-full">
                  {saving ? "Saving…" : "Save Profile"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-card border-primary/20 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="mt-1"
                />
              </div>
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <CheckCircle className="h-4 w-4" /> Password updated successfully
                </div>
              )}
              <Button variant="hero" type="submit" disabled={passwordLoading} className="w-full">
                {passwordLoading ? "Updating…" : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="bg-card border-primary/20">
          <CardContent className="p-5">
            <Link
              to="/my-orders"
              className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <Receipt className="h-4 w-4" /> View Purchase History
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
