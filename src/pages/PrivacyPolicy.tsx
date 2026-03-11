import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 10, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h2>
            <p>seats.ca ("we," "us," or "our") is committed to protecting the privacy and personal information of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website, use our mobile application, or interact with any of our services (collectively, the "Platform"). This policy is designed in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial privacy legislation. By using the Platform, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Information We Collect</h2>
            <p className="mb-3">We collect the following categories of personal information in the course of providing our services:</p>
            <div className="space-y-3">
              <div>
                <p><strong className="text-foreground">Account Information:</strong> When you create an account, we collect your full name, email address, and any additional profile information you choose to provide, such as your city and province of residence. This information is necessary to create and manage your account, process transactions, and communicate with you about your orders.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Payment Information:</strong> When you make a purchase, your payment details (including credit card numbers, billing address, and related financial data) are collected and processed directly by our third-party payment processor, Stripe. seats.ca does not store, process, or have direct access to your full payment card details. Stripe is PCI-DSS Level 1 certified, the highest level of payment security certification available.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Transaction Data:</strong> We maintain records of your ticket purchases, sales, order history, and membership status to provide you with order confirmations, facilitate ticket delivery, process refunds when applicable, and maintain accurate financial records.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Usage & Technical Data:</strong> We automatically collect certain technical information when you access the Platform, including your Internet Protocol (IP) address, browser type and version, operating system, device type, referring URLs, pages visited, time spent on each page, click patterns, and other diagnostic and analytics data. This information helps us understand how users interact with the Platform, improve performance, and detect fraudulent or suspicious activity.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Communications Data:</strong> When you contact us through our contact form, email, or live chat, we collect the content of your messages along with your name and email address to respond to your inquiries and provide customer support.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Newsletter & Marketing Data:</strong> If you subscribe to our newsletter or opt into marketing communications, we collect your email address and track engagement metrics such as open rates and click-through rates to deliver relevant content and improve our communications.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
            <p className="mb-3">We use the personal information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Transaction Processing:</strong> To process ticket purchases and sales, manage your orders, facilitate electronic ticket delivery, handle membership subscriptions, and communicate transactional updates including order confirmations, delivery notifications, and payment receipts.</li>
              <li><strong className="text-foreground">Account Management:</strong> To create, maintain, and secure your user account, verify your identity, manage your membership status, and provide personalized features and recommendations based on your preferences and activity.</li>
              <li><strong className="text-foreground">Platform Improvement:</strong> To analyze usage patterns, diagnose technical issues, optimize site performance, develop new features, conduct internal research and analytics, and improve the overall user experience across the Platform.</li>
              <li><strong className="text-foreground">Customer Support:</strong> To respond to your inquiries, resolve disputes, troubleshoot technical problems, and provide assistance with your account, orders, or the Platform generally.</li>
              <li><strong className="text-foreground">Security & Fraud Prevention:</strong> To detect, investigate, and prevent fraudulent transactions, unauthorized access, abuse of the Platform, and other potentially harmful or illegal activities. This includes maintaining banned user records based on email addresses, IP addresses, and phone numbers when necessary to protect the integrity of the marketplace.</li>
              <li><strong className="text-foreground">Marketing Communications:</strong> To send you newsletters, promotional offers, event updates, and other marketing content, where you have provided your consent. You may opt out of marketing communications at any time by clicking the unsubscribe link in any marketing email or contacting us directly.</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, and government requests, and to enforce our Terms of Service, protect our rights, and defend against legal claims.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Information Sharing & Disclosure</h2>
            <p className="mb-3">We do not sell, rent, or trade your personal information to third parties for their independent marketing purposes. We may share your information in the following limited circumstances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Service Providers:</strong> We share data with trusted third-party service providers who perform services on our behalf, including Stripe (payment processing), email delivery services (transactional and marketing emails), cloud hosting and infrastructure providers, and analytics platforms. These providers are contractually obligated to use your information only for the specific services they provide to us and to maintain appropriate security measures.</li>
              <li><strong className="text-foreground">Transaction Counterparties:</strong> When you buy or sell tickets, certain limited information may be shared between buyer and seller as necessary to complete the transaction and facilitate ticket delivery. We minimize the personal information shared and do not disclose unnecessary details such as your full address or financial information to counterparties.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose your information when required to do so by law, in response to a valid subpoena, court order, or government request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others, investigate fraud, or respond to an emergency.</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your personal information may be transferred as part of the transaction. We will notify you via email or prominent notice on the Platform before your information becomes subject to a different privacy policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Security</h2>
            <p>We implement and maintain industry-standard technical, administrative, and physical security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include, but are not limited to: encryption of data in transit using TLS/SSL protocols, secure cloud infrastructure with access controls, regular security assessments, role-based access controls for internal systems, and row-level security policies on all database tables to ensure users can only access their own data. Payment processing is handled entirely by Stripe, which maintains PCI-DSS Level 1 compliance. Despite our efforts, no method of electronic transmission or storage is completely secure, and we cannot guarantee the absolute security of your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Cookies & Tracking Technologies</h2>
            <p>We use cookies, local storage, and similar tracking technologies to enhance your browsing experience, maintain your session state (such as keeping you logged in), analyze site traffic and usage patterns, and personalize content. The types of cookies we use include: (a) essential cookies required for the Platform to function properly, including authentication and session management; (b) analytics cookies that help us understand how visitors interact with the Platform; and (c) preference cookies that remember your settings and choices. You can manage your cookie preferences through your browser settings, though disabling certain cookies may affect the functionality of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Data Retention</h2>
            <p>We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, comply with our legal and regulatory obligations, resolve disputes, and enforce our agreements. Account information is retained for as long as your account remains active. Transaction records are retained for a minimum of seven (7) years to comply with Canadian tax and financial record-keeping requirements. If you request deletion of your account, we will delete or anonymize your personal information within a reasonable timeframe, except where retention is required by law or for legitimate business purposes such as fraud prevention.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Your Rights Under PIPEDA</h2>
            <p className="mb-3">Under the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial legislation, you have the following rights with respect to your personal information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Right of Access:</strong> You have the right to request access to the personal information we hold about you, subject to limited exceptions under the law.</li>
              <li><strong className="text-foreground">Right of Correction:</strong> You have the right to request correction of any personal information that is inaccurate, incomplete, or out of date. You can update certain information directly through your account settings.</li>
              <li><strong className="text-foreground">Right to Withdraw Consent:</strong> You may withdraw your consent to the collection, use, or disclosure of your personal information at any time, subject to legal or contractual restrictions and reasonable notice. Withdrawal of consent may limit your ability to use certain features of the Platform.</li>
              <li><strong className="text-foreground">Right to Deletion:</strong> You may request the deletion of your personal information, and we will comply with your request unless retention is required by law or necessary for legitimate business purposes.</li>
              <li><strong className="text-foreground">Right to Complain:</strong> If you believe your privacy rights have been violated, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada (OPC) at www.priv.gc.ca.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at privacy@seats.ca. We will respond to your request within 30 days, as required by PIPEDA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Children's Privacy</h2>
            <p>The Platform is not intended for use by individuals under the age of 18 or the age of majority in their province or territory of residence. We do not knowingly collect personal information from children or minors. If we become aware that we have inadvertently collected personal information from a minor, we will take steps to delete that information promptly. If you believe that a minor has provided us with personal information, please contact us at privacy@seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Third-Party Links</h2>
            <p>The Platform may contain links to third-party websites, services, or applications that are not operated or controlled by seats.ca, including but not limited to payment processors, social media platforms, ride-sharing services, and hotel booking sites. This Privacy Policy does not apply to those third-party services, and we are not responsible for their privacy practices, content, or data collection policies. We encourage you to review the privacy policies of any third-party services before providing them with your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. International Data Transfers</h2>
            <p>Your personal information may be stored and processed on servers located outside of Canada, including in the United States, where our cloud infrastructure and service providers may operate. When your information is transferred outside of Canada, it may be subject to the laws of the jurisdiction in which it is stored. We take reasonable steps to ensure that your information receives an adequate level of protection in the jurisdictions in which it is processed, including through contractual obligations with our service providers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Changes to This Policy</h2>
            <p>We reserve the right to update or modify this Privacy Policy at any time to reflect changes in our practices, technology, legal requirements, or business operations. When we make material changes, we will update the "Last updated" date at the top of this page and may notify you by email or through a prominent notice on the Platform. Your continued use of the Platform after any changes to this Privacy Policy constitutes your acceptance of the updated policy. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact our Privacy Officer at:</p>
            <div className="mt-2 space-y-1">
              <p><strong className="text-foreground">Privacy Inquiries:</strong> michaelkurtz66@hotmail.com</p>
              <p><strong className="text-foreground">General Support:</strong> michaelkurtz66@hotmail.com</p>
              <p><strong className="text-foreground">Jurisdiction:</strong> Province of Ontario, Canada</p>
            </div>
            <p className="mt-3">We are committed to working with you to resolve any complaints or concerns about your privacy. If you are not satisfied with our response, you may contact the Office of the Privacy Commissioner of Canada at 1-800-282-1376 or visit www.priv.gc.ca.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;