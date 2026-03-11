import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 11, 2026</p>

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
                <p><strong className="text-foreground">Account Information:</strong> When you create an account, we collect your full name, email address, phone number, and any additional profile information you choose to provide, such as your city and province of residence. This information is necessary to create and manage your account, process transactions, and communicate with you about your orders.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Payment Information:</strong> When you make a purchase, your payment details (including credit card numbers, billing address, and related financial data) are collected and processed directly by our third-party payment processor, Stripe. seats.ca does not store, process, or have direct access to your full payment card details. Stripe is PCI-DSS Level 1 certified, the highest level of payment security certification available.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Transaction Data:</strong> We maintain records of your ticket purchases, sales, order history, and membership status to provide you with order confirmations, facilitate ticket delivery, process refunds when applicable, and maintain accurate financial records.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Identity Verification Data:</strong> In certain circumstances, we may collect and verify identity-related information from sellers, resellers, or buyers for fraud prevention, Know Your Customer (KYC) compliance, anti-money laundering (AML) obligations, and tax reporting purposes. This may include government-issued identification documents, business registration details, and tax identification numbers. Such data is handled with heightened security and retained only as long as required by law.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Usage & Technical Data:</strong> We automatically collect certain technical information when you access the Platform, including your Internet Protocol (IP) address, browser type and version, operating system, device type, referring URLs, pages visited, time spent on each page, click patterns, and other diagnostic and analytics data. This information helps us understand how users interact with the Platform, improve performance, and detect fraudulent or suspicious activity.</p>
              </div>
              <div>
                <p><strong className="text-foreground">IP-Based Geolocation Data:</strong> We use your IP address to determine your approximate geographic location (city, province/state, and country). This data is used for fraud detection, enforcing geographic restrictions on ticket sales where applicable, providing localized content and event recommendations, complying with regional regulatory requirements, and identifying suspicious activity such as transactions originating from high-risk jurisdictions. We do not use IP geolocation to track your precise physical location.</p>
              </div>
              <div>
                <p><strong className="text-foreground">Communications Data:</strong> When you contact us through our contact form, email, or live chat (including AI-assisted support), we collect the content of your messages along with your name and email address to respond to your inquiries and provide customer support. Chat conversations may be processed by third-party AI services as described in Section 11.</p>
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
              <li><strong className="text-foreground">Payment Verification & Risk Assessment:</strong> We may use payment card evaluation systems and fraud detection tools (provided by Stripe and other risk assessment services) to assess the legitimacy of transactions. These tools may evaluate factors such as card origin, billing address verification, velocity checks, and device fingerprinting. Based on these assessments, we reserve the right to decline a transaction, request an alternative payment method, or require additional verification before processing a purchase. This is done to protect both buyers and sellers from fraudulent activity.</li>
              <li><strong className="text-foreground">Profiling & Personalization:</strong> We may use your browsing history, purchase history, location data, and preferences to personalize your experience on the Platform, including displaying relevant events, teams, and ticket recommendations. You are not subject to decisions based solely on automated profiling that produce legal or similarly significant effects without human review.</li>
              <li><strong className="text-foreground">Marketing Communications:</strong> To send you newsletters, promotional offers, event updates, and other marketing content, where you have provided your consent. You may opt out of marketing communications at any time by clicking the unsubscribe link in any marketing email or contacting us directly.</li>
              <li><strong className="text-foreground">Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, and government requests, and to enforce our Terms of Service, protect our rights, and defend against legal claims.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Information Shared with Sellers</h2>
            <p className="mb-3">When you purchase tickets through seats.ca, certain limited information may be shared with the ticket seller or authorized reseller to facilitate the transaction and deliver your tickets. This may include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your first and last name (as required for ticket transfer or will-call pickup)</li>
              <li>Your email address (for electronic ticket delivery)</li>
              <li>The number of tickets purchased and seat details</li>
              <li>Order confirmation number</li>
            </ul>
            <p className="mt-3">We do not share your full billing address, payment card details, phone number, or IP address with sellers. Sellers are contractually prohibited from using buyer information for any purpose other than completing the specific ticket transaction. Misuse of buyer data by a seller may result in immediate removal from the Platform. If you have concerns about how a seller has handled your information, please contact us at info@seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Seller & Reseller Compliance</h2>
            <p>Sellers and authorized resellers who list tickets on seats.ca may be required to provide additional personal and business information for identity verification, tax compliance, and regulatory purposes. This may include legal name, business name, tax identification numbers, bank account details for payout processing (handled securely through Stripe Connect or equivalent), and government-issued identification. Resellers are responsible for complying with all applicable tax laws in their jurisdiction, including the collection and remittance of applicable sales taxes. seats.ca does not provide tax advice and is not responsible for a seller's failure to comply with their tax obligations. Seller and reseller data is retained in accordance with applicable legal and financial record-keeping requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Information Sharing & Disclosure</h2>
            <p className="mb-3">We do not sell, rent, or trade your personal information to third parties for their independent marketing purposes. We may share your information in the following limited circumstances:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Service Providers:</strong> We share data with trusted third-party service providers who perform services on our behalf, including Stripe (payment processing), email delivery services (transactional and marketing emails), cloud hosting and infrastructure providers, AI service providers (for chat support and content processing), and analytics platforms. These providers are contractually obligated to use your information only for the specific services they provide to us and to maintain appropriate security measures.</li>
              <li><strong className="text-foreground">Transaction Counterparties:</strong> When you buy or sell tickets, certain limited information is shared between buyer and seller as necessary to complete the transaction and facilitate ticket delivery, as described in Section 4 above.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose your information when required to do so by law, in response to a valid subpoena, court order, or government request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others, investigate fraud, or respond to an emergency.</li>
              <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger, acquisition, reorganization, sale of assets, or bankruptcy, your personal information may be transferred as part of the transaction. We will notify you via email or prominent notice on the Platform before your information becomes subject to a different privacy policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Data Security</h2>
            <p>We implement and maintain industry-standard technical, administrative, and physical security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include, but are not limited to: encryption of data in transit using TLS/SSL protocols, secure cloud infrastructure with access controls, regular security assessments, role-based access controls for internal systems, and row-level security policies on all database tables to ensure users can only access their own data. Payment processing is handled entirely by Stripe, which maintains PCI-DSS Level 1 compliance. Despite our efforts, no method of electronic transmission or storage is completely secure, and we cannot guarantee the absolute security of your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Data Breach Notification</h2>
            <p>In the event of a data breach involving your personal information that creates a real risk of significant harm, we will notify affected individuals and the Office of the Privacy Commissioner of Canada (OPC) as soon as feasible, in accordance with PIPEDA's mandatory breach reporting requirements. Notification will include a description of the incident, the types of personal information involved, the steps we have taken or intend to take to reduce the risk of harm, and recommended actions you can take to protect yourself. We maintain an internal breach response plan and conduct regular assessments to identify and mitigate data security risks. We will also maintain a record of all breaches of security safeguards, regardless of whether they meet the notification threshold, as required under PIPEDA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Cookies & Tracking Technologies</h2>
            <p className="mb-3">We use cookies, local storage, and similar tracking technologies to enhance your browsing experience, maintain your session state, analyze site traffic, and personalize content. The types of cookies and tracking technologies we use include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Strictly Necessary Cookies:</strong> Required for the Platform to function properly, including authentication tokens, session management, and security-related cookies. These cannot be disabled without affecting core functionality.</li>
              <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how visitors interact with the Platform, including page views, traffic sources, bounce rates, and user flow. We may use third-party analytics services that set their own cookies.</li>
              <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings, choices, and preferences (such as language, region, or display options) to provide a more personalized experience.</li>
              <li><strong className="text-foreground">Local Storage:</strong> We use browser local storage to maintain session state, cache certain data for performance optimization, and store non-sensitive user preferences.</li>
            </ul>
            <p className="mt-3">You can manage your cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, though disabling certain cookies may affect the functionality of the Platform. For more information about cookies and how to manage them, visit www.allaboutcookies.org.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Data Retention</h2>
            <p>We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, comply with our legal and regulatory obligations, resolve disputes, and enforce our agreements. Account information is retained for as long as your account remains active. Transaction records are retained for a minimum of seven (7) years to comply with Canadian tax and financial record-keeping requirements. If you request deletion of your account, we will delete or anonymize your personal information within a reasonable timeframe, except where retention is required by law or for legitimate business purposes such as fraud prevention.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Third-Party APIs & Services</h2>
            <p className="mb-3">The Platform integrates with third-party application programming interfaces (APIs) and services to provide certain features and functionality. These integrations may include, but are not limited to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Payment Processing:</strong> Stripe for secure payment handling, subscription management, and seller payouts.</li>
              <li><strong className="text-foreground">AI-Powered Support:</strong> Third-party AI language model providers for our live chat and customer support features. Chat messages may be processed by these AI services to generate responses. While we select providers with strong privacy practices, the processing of chat content is subject to those providers' own data handling policies.</li>
              <li><strong className="text-foreground">Event Data & Scheduling:</strong> Third-party sports data APIs for event schedules, scores, team information, and related content.</li>
              <li><strong className="text-foreground">Transportation & Travel:</strong> Integration with ride-sharing services (such as Uber) and travel booking platforms for user convenience.</li>
              <li><strong className="text-foreground">Email Delivery:</strong> Third-party email service providers for transactional notifications and marketing communications.</li>
              <li><strong className="text-foreground">Cloud Infrastructure:</strong> Cloud hosting, database, and storage providers for Platform operation and data management.</li>
            </ul>
            <p className="mt-3"><strong className="text-foreground">Disclaimer:</strong> While we take reasonable steps to select reputable third-party service providers, seats.ca is not responsible for the privacy practices, data handling, security measures, or policies of any third-party API providers or services integrated with the Platform. Data transmitted to or processed by third-party services is subject to those third parties' own terms of service and privacy policies. We encourage you to review those policies independently. seats.ca shall not be held liable for any data loss, unauthorized access, or privacy breach that occurs within a third-party provider's systems or infrastructure.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Your Rights Under PIPEDA</h2>
            <p className="mb-3">Under the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable provincial legislation, you have the following rights with respect to your personal information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Right of Access:</strong> You have the right to request access to the personal information we hold about you, subject to limited exceptions under the law.</li>
              <li><strong className="text-foreground">Right of Correction:</strong> You have the right to request correction of any personal information that is inaccurate, incomplete, or out of date. You can update certain information directly through your account settings.</li>
              <li><strong className="text-foreground">Right to Withdraw Consent:</strong> You may withdraw your consent to the collection, use, or disclosure of your personal information at any time, subject to legal or contractual restrictions and reasonable notice. Withdrawal of consent may limit your ability to use certain features of the Platform.</li>
              <li><strong className="text-foreground">Right to Deletion:</strong> You may request the deletion of your personal information, and we will comply with your request unless retention is required by law or necessary for legitimate business purposes.</li>
              <li><strong className="text-foreground">Right to Information About Automated Decision-Making:</strong> You have the right to be informed about any automated decision-making processes that may affect you, including fraud scoring and payment verification systems, and to request human review of any significant decisions made solely through automated means.</li>
              <li><strong className="text-foreground">Right to Complain:</strong> If you believe your privacy rights have been violated, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada (OPC) at www.priv.gc.ca.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, please contact us at legal@seats.ca. We will respond to your request within 30 days, as required by PIPEDA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Children's Privacy</h2>
            <p>The Platform is not intended for use by individuals under the age of 18 or the age of majority in their province or territory of residence. We do not knowingly collect personal information from children or minors. If we become aware that we have inadvertently collected personal information from a minor, we will take steps to delete that information promptly. If you believe that a minor has provided us with personal information, please contact us at legal@seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Third-Party Links</h2>
            <p>The Platform may contain links to third-party websites, services, or applications that are not operated or controlled by seats.ca, including but not limited to payment processors, social media platforms, ride-sharing services, and hotel booking sites. This Privacy Policy does not apply to those third-party services, and we are not responsible for their privacy practices, content, or data collection policies. We encourage you to review the privacy policies of any third-party services before providing them with your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. International Data Transfers</h2>
            <p>Your personal information may be stored and processed on servers located outside of Canada, including in the United States, where our cloud infrastructure and service providers may operate. When your information is transferred outside of Canada, it may be subject to the laws of the jurisdiction in which it is stored, which may differ from Canadian privacy law. We take reasonable steps to ensure that your information receives an adequate level of protection in the jurisdictions in which it is processed, including through contractual obligations with our service providers that require them to protect your data to standards substantially equivalent to those required under PIPEDA.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">16. Changes to This Policy</h2>
            <p>We reserve the right to update or modify this Privacy Policy at any time to reflect changes in our practices, technology, legal requirements, third-party integrations, or business operations. When we make material changes, we will update the "Last updated" date at the top of this page and may notify you by email or through a prominent notice on the Platform. Your continued use of the Platform after any changes to this Privacy Policy constitutes your acceptance of the updated policy. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">17. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact our Privacy Officer at:</p>
            <div className="mt-2 space-y-1">
              <p><strong className="text-foreground">Privacy Inquiries:</strong> legal@seats.ca</p>
              <p><strong className="text-foreground">General Support:</strong> info@seats.ca</p>
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
