import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, Clock, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be under 5000 characters"),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus("sending");
    try {
      const { data, error } = await supabase.functions.invoke("contact-form", {
        body: result.data,
      });
      if (error) throw error;
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
      toast({ title: "Message sent! ✉️", description: "We'll get back to you within 24 hours." });
    } catch (err: any) {
      setStatus("idle");
      toast({ title: "Error", description: err.message || "Could not send message. Please email support@seats.ca directly.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Have a question, feedback, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
                {status === "sent" ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                      <Send className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="font-display text-2xl font-bold">Message Sent!</h3>
                    <p className="text-muted-foreground">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                    <Button variant="outline" onClick={() => setStatus("idle")} className="mt-4">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                        Your Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className={`w-full px-4 py-3 rounded-lg bg-background border ${errors.name ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm`}
                      />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`w-full px-4 py-3 rounded-lg bg-background border ${errors.email ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm`}
                      />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                        className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us what's on your mind..."
                        className={`w-full px-4 py-3 rounded-lg bg-background border ${errors.message ? "border-destructive" : "border-border"} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none`}
                      />
                      {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/5000</p>
                    </div>

                    <Button type="submit" variant="hero" size="lg" className="w-full" disabled={status === "sending"}>
                      <Send className="h-4 w-4 mr-2" />
                      {status === "sending" ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-2 space-y-5">
              <a
                href="mailto:support@seats.ca"
                className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 shadow-lg hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Email Us Directly</h3>
                  <p className="text-primary text-sm font-medium mt-0.5">michaelkurtz66@hotmail.com</p>
                </div>
              </a>

              <div className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Click the chat bubble in the bottom-right for instant help.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm">Response Time</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">We respond to all inquiries within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
