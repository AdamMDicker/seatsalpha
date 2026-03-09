import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, Send, Users, Loader2, Trash2 } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface NewsletterSend {
  id: string;
  subject: string;
  recipient_count: number;
  created_at: string;
}

const AdminNewsletter = () => {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sends, setSends] = useState<NewsletterSend[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [subsRes, sendsRes] = await Promise.all([
      supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
      supabase.from("newsletter_sends").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    if (subsRes.data) setSubscribers(subsRes.data);
    if (sendsRes.data) setSends(sendsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const activeCount = subscribers.filter((s) => s.is_active).length;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Subject and body are required", variant: "destructive" });
      return;
    }
    if (activeCount === 0) {
      toast({ title: "No active subscribers", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { subject: subject.trim(), body: body.trim() },
      });

      if (error) throw error;

      toast({ title: "Newsletter sent! 🎉", description: `Sent to ${data?.recipientCount ?? activeCount} subscribers` });
      setSubject("");
      setBody("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (id: string) => {
    await supabase.from("newsletter_subscribers").delete().eq("id", id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Subscriber removed" });
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            Compose Newsletter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. New Blue Jays tickets just dropped!"
              className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Write your newsletter content here..."
              className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-y"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Will send to <span className="font-semibold text-primary">{activeCount}</span> active subscriber{activeCount !== 1 && "s"}
            </p>
            <Button variant="hero" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Newsletter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Subscribers ({subscribers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No subscribers yet.</p>
          ) : (
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {subscribers.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()} ·{" "}
                      <span className={sub.is_active ? "text-green-500" : "text-red-500"}>
                        {sub.is_active ? "Active" : "Unsubscribed"}
                      </span>
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(sub.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send History */}
      {sends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Send History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {sends.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()} · {s.recipient_count} recipients
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminNewsletter;
