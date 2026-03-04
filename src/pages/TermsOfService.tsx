import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 4, 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using seats.ca, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Platform Description</h2>
            <p>seats.ca is Canada's first no-fee ticket marketplace. We connect buyers and sellers of event tickets without charging service fees on transactions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h2>
            <p>You must create an account to buy or sell tickets. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Ticket Purchases</h2>
            <p>All ticket sales are final. Prices are set by sellers and are listed in Canadian dollars. seats.ca does not guarantee entry to any event — we facilitate transactions between buyers and sellers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Seller Obligations</h2>
            <p>Sellers must ensure that all tickets listed are valid, authentic, and will be delivered in a timely manner. Listing fraudulent or invalid tickets is strictly prohibited and will result in account termination.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Prohibited Conduct</h2>
            <p>You may not use seats.ca for any unlawful purpose, attempt to gain unauthorized access to our systems, interfere with other users' use of the platform, or engage in fraudulent activity.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
            <p>seats.ca is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you for the relevant transaction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Intellectual Property</h2>
            <p>All content on seats.ca, including logos, text, and design, is the property of seats.ca and is protected by Canadian intellectual property laws. You may not reproduce or distribute any content without written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Governing Law</h2>
            <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
            <p>For questions about these Terms, contact us at legal@seats.ca.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
