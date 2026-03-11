import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 11, 2026</p>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>By accessing, browsing, or using the seats.ca website, mobile application, or any related services (collectively, the "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms in their entirety, you must immediately discontinue use of the Platform. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and seats.ca ("we," "us," or "our"). We reserve the right to modify these Terms at any time, and your continued use of the Platform following any changes constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Platform Description</h2>
            <p>seats.ca is Canada's first no-fee ticket marketplace, purpose-built to eliminate the hidden service charges and inflated processing fees that have long burdened Canadian sports fans. Our Platform connects ticket buyers directly with individual sellers and authorized resellers, facilitating the purchase and sale of tickets to live sporting events across Canada, including but not limited to Major League Baseball (MLB), the National Hockey League (NHL), the National Basketball Association (NBA), the National Football League (NFL), Major League Soccer (MLS), the Canadian Football League (CFL), and the Women's National Basketball Association (WNBA). seats.ca operates as a marketplace intermediary — we are not the ticket seller, promoter, venue operator, or event organizer unless expressly stated otherwise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Membership & No-Fee Access</h2>
            <p>seats.ca offers an optional annual membership program that grants members access to tickets at face value with zero service fees, zero processing charges, and zero hidden costs. Membership fees are non-refundable once the membership period has commenced. Non-members may still purchase tickets through the Platform; however, a standard service fee will be applied at checkout. Membership benefits, pricing, and terms may be updated from time to time at our sole discretion. Current membership pricing and features are displayed on the Membership page of the Platform. Membership is personal and non-transferable — each membership is tied to a single user account and may not be shared, resold, or assigned to another individual.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. User Accounts</h2>
            <p>To purchase or sell tickets on the Platform, you must create a user account by providing accurate, current, and complete information. You are solely responsible for safeguarding your login credentials and for all activity that occurs under your account, whether or not authorized by you. You agree to immediately notify seats.ca of any unauthorized use of your account or any other breach of security. We reserve the right to suspend or terminate any account that we believe, in our sole discretion, has been compromised, is being used fraudulently, or is in violation of these Terms. You must be at least 18 years of age or the age of majority in your province or territory of residence to create an account and use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Ticket Purchases</h2>
            <p>All ticket purchases made through seats.ca are final and non-refundable unless otherwise required by applicable law or expressly stated in the listing. Ticket prices are set by the individual seller or reseller and are displayed in Canadian dollars (CAD). seats.ca does not set, control, or guarantee ticket prices. While we make every reasonable effort to ensure the accuracy of event information displayed on the Platform — including dates, times, venues, and opponent details — we cannot guarantee that this information is free from errors. In the event of an event cancellation, postponement, or venue change, the ticket seller and/or event organizer's refund and exchange policies shall apply. seats.ca is not responsible for any losses, expenses, or inconvenience arising from event changes or cancellations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Ticket Delivery</h2>
            <p>All tickets purchased through seats.ca are delivered electronically. Delivery methods may include, but are not limited to, email transfer, mobile ticket transfer, or direct download through the Platform. Sellers are required to deliver tickets within the timeframe specified in the listing. In the interest of buyer protection, seller payouts are processed after the event date to ensure that valid tickets have been delivered and the buyer has been able to attend the event. If a seller fails to deliver valid tickets as described in the listing, seats.ca may, at its discretion, issue a full refund to the buyer and take appropriate enforcement action against the seller's account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Seller Obligations</h2>
            <p>By listing tickets for sale on seats.ca, sellers represent and warrant that: (a) they are the rightful owner of the tickets or are authorized to sell them on behalf of the owner; (b) the tickets are valid, authentic, and have not been reported as lost, stolen, or previously used; (c) the tickets will be delivered to the buyer in a timely manner and in the format specified in the listing; (d) all information in the listing, including section, row, seat numbers, and any noted perks or inclusions, is accurate and not misleading; and (e) the tickets have not been listed for sale on any other platform simultaneously in a manner that could result in overselling. Violation of any of these obligations may result in immediate account suspension, withholding of payment, and permanent removal from the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Seller Data Responsibilities</h2>
            <p>When a ticket transaction is completed, sellers receive limited buyer information necessary to facilitate ticket delivery, as described in Section 4 of our Privacy Policy. This may include the buyer's name, email address, ticket quantity, and order confirmation number. Sellers agree that they: (a) will use buyer information solely for the purpose of completing the specific ticket transaction; (b) will not store, share, sell, or use buyer information for any other purpose, including marketing, profiling, or resale to third parties; (c) will delete buyer information once the transaction and ticket delivery are complete; and (d) will immediately notify seats.ca if buyer data has been inadvertently exposed or compromised. Misuse of buyer personal information is a material breach of these Terms and may result in immediate account termination, withholding of all pending payouts, and potential legal action.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Reseller Program</h2>
            <p>seats.ca offers an authorized Reseller Program for businesses and individuals who wish to sell tickets at volume. Reseller accounts are subject to an application and approval process, and approved resellers must comply with all applicable reseller policies, including but not limited to pricing guidelines, inventory accuracy requirements, and league-specific restrictions. Resellers may upload ticket inventory individually or via CSV bulk import. Resellers may be required to provide additional personal and business information for identity verification (KYC), tax compliance, and regulatory purposes, as described in Section 5 of our Privacy Policy. Resellers are solely responsible for complying with all applicable tax laws in their jurisdiction, including the collection and remittance of applicable sales taxes. seats.ca does not provide tax advice. seats.ca reserves the right to revoke reseller status at any time for non-compliance, fraudulent activity, or conduct that undermines the integrity of the marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Prohibited Conduct</h2>
            <p>You agree not to: (a) use the Platform for any unlawful, fraudulent, or deceptive purpose; (b) list counterfeit, invalid, duplicate, or non-existent tickets; (c) attempt to circumvent, disable, or interfere with any security features of the Platform; (d) use automated scripts, bots, scrapers, or other automated means to access or interact with the Platform; (e) impersonate another person or entity, or falsely represent your affiliation with any person or entity; (f) engage in price manipulation, scalping beyond legally permitted limits, or any other form of market manipulation; (g) harass, threaten, or abuse other users, sellers, or seats.ca personnel; (h) use the Platform to transmit malware, viruses, or other harmful code; (i) misuse buyer or seller personal information obtained through the Platform; or (j) violate any applicable local, provincial, federal, or international law or regulation. We reserve the right to ban any user engaged in prohibited conduct, including but not limited to email bans, IP bans, and phone number bans.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Payment Processing & Verification</h2>
            <p>All payments on seats.ca are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. seats.ca does not store, process, or have direct access to your full credit card numbers or banking details. By completing a purchase, you authorize the applicable charge to your payment method. All prices are displayed and charged in Canadian dollars (CAD). You are responsible for any applicable taxes, including but not limited to Harmonized Sales Tax (HST) or Goods and Services Tax (GST), as determined by your province or territory of residence and the location of the event.</p>
            <p className="mt-3">We employ payment card evaluation systems and fraud detection tools to assess the legitimacy of transactions, as described in Section 3 of our Privacy Policy. These tools evaluate factors such as card origin, billing address verification, transaction velocity, and device fingerprinting. Based on these assessments, we reserve the right to: (a) decline a transaction; (b) request an alternative payment method; (c) require additional identity verification before processing a purchase; or (d) cancel a completed transaction if fraudulent activity is subsequently detected. These measures are designed to protect all users of the Platform and the integrity of the marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Third-Party Services & APIs</h2>
            <p>The Platform relies on third-party application programming interfaces (APIs) and services for various features and functionality, including but not limited to payment processing, event scheduling data, AI-powered customer support, transportation integrations, email delivery, and cloud infrastructure, as described in detail in Section 11 of our Privacy Policy.</p>
            <p className="mt-3"><strong className="text-foreground">Disclaimer of Liability:</strong> seats.ca is not responsible for the availability, accuracy, reliability, security, or privacy practices of any third-party API provider or service integrated with the Platform. Third-party services are provided "as is" and are subject to those providers' own terms of service and privacy policies. seats.ca shall not be liable for any loss, damage, or inconvenience arising from: (a) outages, errors, or interruptions in third-party services; (b) inaccuracies in data provided by third-party APIs (including but not limited to event schedules, scores, or venue information); (c) data breaches or security incidents within a third-party provider's systems; (d) changes to a third-party provider's terms, pricing, or functionality; or (e) any actions taken by a third-party provider with respect to your data. Your use of any third-party service accessible through or linked from the Platform is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Intellectual Property</h2>
            <p>All content on the Platform, including but not limited to the seats.ca name, logo, website design, page layouts, graphics, text, software, and underlying code, is the exclusive property of seats.ca and is protected under Canadian and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from the Platform without our prior written consent. Team names, league logos, and related marks referenced on the Platform are the property of their respective owners and are used for identification purposes only. Their use does not imply endorsement by or affiliation with seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Privacy & Data Protection</h2>
            <p>Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, disclose, and protect your personal information, including information about seller data sharing (Section 4), payment verification systems (Section 3), IP-based geolocation (Section 2), third-party API integrations (Section 11), data breach notification procedures (Section 8), and your rights under PIPEDA (Section 12). The Privacy Policy is incorporated into these Terms by reference. By using the Platform, you acknowledge that you have read and understood our Privacy Policy and consent to the practices described therein.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, seats.ca, its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform, including but not limited to loss of profits, data, goodwill, or other intangible losses. This limitation extends to damages arising from the acts, omissions, or failures of any third-party service provider integrated with the Platform. Our total aggregate liability for any claim arising from or related to these Terms or the Platform shall not exceed the greater of (a) the amount you paid to seats.ca for the specific transaction giving rise to the claim, or (b) fifty Canadian dollars (CAD $50.00). This limitation applies regardless of the legal theory under which the claim is brought, including contract, tort (including negligence), strict liability, or otherwise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">16. Disclaimer of Warranties</h2>
            <p>The Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. seats.ca does not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not guarantee admission to any event, the accuracy of any listing, the accuracy of data provided by third-party APIs, or the conduct of any buyer or seller on the Platform. You use the Platform at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">17. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless seats.ca, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from: (a) your use of or access to the Platform; (b) your violation of these Terms; (c) your violation of any third-party right, including without limitation any intellectual property, privacy, or proprietary right; (d) any claim that your listing or conduct on the Platform caused damage to a third party; (e) any misuse of personal information obtained through the Platform; or (f) any dispute between you and another user of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">18. Dispute Resolution</h2>
            <p>In the event of a dispute arising from a ticket transaction, seats.ca encourages both parties to first attempt to resolve the matter directly. If a resolution cannot be reached, you may contact our support team at info@seats.ca for assistance. seats.ca reserves the right, but is not obligated, to mediate disputes between buyers and sellers. Any formal legal disputes arising out of or relating to these Terms shall be resolved through binding arbitration in accordance with the Arbitration Act (Ontario), unless otherwise required by applicable consumer protection law. Class action lawsuits and class-wide arbitrations are not permitted under these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">19. Termination</h2>
            <p>We reserve the right to suspend, restrict, or terminate your access to the Platform at any time, with or without cause or prior notice, including but not limited to cases of suspected fraud, violation of these Terms, misuse of personal information, or conduct that we determine is harmful to other users or to the integrity of the marketplace. Upon termination, your right to use the Platform will immediately cease. Any provisions of these Terms that by their nature should survive termination shall remain in effect, including but not limited to sections relating to intellectual property, limitation of liability, indemnification, privacy, and governing law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">20. Governing Law</h2>
            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in the Province of Ontario for the resolution of any legal disputes arising out of or in connection with these Terms or your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">21. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable, while preserving the original intent of the parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">22. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy and any other legal notices or policies published on the Platform, constitute the entire agreement between you and seats.ca regarding your use of the Platform and supersede all prior agreements, understandings, and communications, whether written or oral, relating to the subject matter hereof.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">23. Contact</h2>
            <p>If you have any questions, concerns, or requests regarding these Terms of Service, please contact us at:</p>
            <div className="mt-2 space-y-1">
              <p><strong className="text-foreground">Email:</strong> legal@seats.ca</p>
              <p><strong className="text-foreground">General Support:</strong> info@seats.ca</p>
              <p><strong className="text-foreground">Jurisdiction:</strong> Province of Ontario, Canada</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
