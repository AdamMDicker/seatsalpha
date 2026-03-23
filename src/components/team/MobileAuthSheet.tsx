import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, ArrowLeft, Ticket } from "lucide-react";

interface MobileAuthSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MobileAuthSheet = ({ open, onOpenChange, onSuccess }: MobileAuthSheetProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        onOpenChange(false);
        onSuccess();
      }
    } else {
      const { error, data } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else if (data?.session) {
        onOpenChange(false);
        onSuccess();
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
        toast({ title: "📬 Can't find the email?", description: "Please check your spam/junk folder if you don't see it in your inbox." });
        setResendEmail(email);
        setShowResend(true);
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!resendEmail) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: resendEmail });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent", description: "A new verification link has been sent. Check your spam/junk folder if you don't see it." });
    }
    setResending(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setForgotSent(true);
      toast({ title: "Check your email", description: "We sent you a password reset link." });
    }
    setForgotLoading(false);
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="font-display text-lg font-bold">
              seats<span className="text-primary">.ca</span>
            </span>
          </div>
          <DrawerTitle className="text-lg">
            {showForgot ? "Reset Password" : isLogin ? "Sign in to continue" : "Create account"}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            {showForgot ? "Enter your email for a reset link" : isLogin ? "Sign in to purchase tickets" : "Join Canada's no extra fees ticket platform"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {showForgot ? (
            <div className="space-y-3">
              {forgotSent ? (
                <div className="text-center py-4">
                  <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Check your inbox for a reset link.</p>
                  <Button variant="outline" size="sm" onClick={() => { setForgotSent(false); }} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Send again
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
                  </div>
                  <Button variant="hero" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}
              <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-sm text-muted-foreground hover:text-primary mx-auto block mt-2 flex items-center gap-1 justify-center">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required className={inputClass} />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button variant="hero" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
                {isLogin && (
                  <button type="button" onClick={() => { setShowForgot(true); setForgotEmail(email); }} className="text-xs text-muted-foreground hover:text-primary block text-right w-full">
                    Forgot your password?
                  </button>
                )}
              </form>

              {showResend && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Didn't receive verification email?</p>
                  <Button variant="outline" size="sm" onClick={handleResend} disabled={resending} className="gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Sending..." : "Resend"}
                  </Button>
                </div>
              )}

              <button onClick={() => { setIsLogin(!isLogin); setShowResend(false); }} className="text-sm text-muted-foreground hover:text-primary block text-center w-full">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileAuthSheet;
