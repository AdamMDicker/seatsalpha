import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Have a question or need help? We're here for you.
            </p>
          </div>

          <div className="space-y-6">
            <a
              href="mailto:info@seats.ca"
              className="flex items-start gap-4 bg-card border border-border rounded-xl p-6 shadow-lg hover:border-primary/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">Email Us</h3>
                <p className="text-primary font-medium mt-1">info@seats.ca</p>
                <p className="text-sm text-muted-foreground mt-1">For general inquiries, partnerships, and support.</p>
              </div>
            </a>

            <div className="flex items-start gap-4 bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Live Chat</h3>
                <p className="text-sm text-muted-foreground mt-1">Click the chat bubble in the bottom-right corner for instant answers to common questions.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Response Time</h3>
                <p className="text-sm text-muted-foreground mt-1">We aim to respond to all emails within 24 hours.</p>
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
