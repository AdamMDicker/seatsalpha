import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 4, 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>When you use seats.ca, we may collect personal information such as your name, email address, phone number, billing address, and payment details. We also collect usage data including your IP address, browser type, and pages visited.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>We use your information to process ticket transactions, manage your account, communicate order confirmations, provide customer support, and improve our services. We may also use your data to send promotional communications, which you can opt out of at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your data with trusted third-party service providers who assist us in operating our platform, processing payments, and delivering services. These providers are contractually obligated to protect your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of electronic transmission or storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Cookies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Your Rights</h2>
            <p>Under Canadian privacy law (PIPEDA), you have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at privacy@seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised date. Continued use of our services constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@seats.ca.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
