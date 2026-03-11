import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GATE_PASSWORD = "Michael1999";
const STORAGE_KEY = "seats_gate_unlocked";

const ComingSoonGate = ({ children }: { children: React.ReactNode }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === GATE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-['Space_Grotesk']">
            Coming Soon
          </h1>
          <p className="text-muted-foreground text-lg">
            We're building something great. Enter the password to preview.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`h-12 text-center text-lg bg-card border-border ${error ? "border-destructive animate-shake" : ""}`}
            autoFocus
          />
          <Button type="submit" className="w-full h-12 text-lg font-semibold">
            Enter Site
          </Button>
          {error && (
            <p className="text-destructive text-sm">Incorrect password. Try again.</p>
          )}
        </form>

        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} seats.ca — All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ComingSoonGate;
