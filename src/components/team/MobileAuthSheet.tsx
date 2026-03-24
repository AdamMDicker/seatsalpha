import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
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
      toast({ title: "Email sent", description: "A new verification link has been sent." });
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
                  <p className="text-sm text-muted-foreground mb-1">Check your inbox for a reset link.</p>
                  <p className="text-xs font-bold text-primary mb-3">If you don't see the email, please check your spam/junk folder.</p>
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
                  <Mail className="h-6 w-6 text-primary mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-foreground mb-1">We've sent a verification email!</p>
                  <p className="text-[11px] font-bold text-primary mb-2">📬 If you don't see the email, please check your spam/junk folder.</p>
                  <Button variant="outline" size="sm" onClick={handleResend} disabled={resending} className="gap-1.5">
                    <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Sending..." : "Resend"}
                  </Button>
                </div>
              )}

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    toast({ title: "Error", description: String(error), variant: "destructive" });
                  }
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>

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
