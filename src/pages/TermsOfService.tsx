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
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Dynamic Inventory & Ticket Availability</h2>
            <p>All ticket listings on seats.ca are part of a dynamic, real-time inventory system. Ticket availability displayed on the Platform is indicative only and does not constitute a guarantee that a specific ticket, section, row, or seat is available for purchase. Inventory may change at any moment due to simultaneous purchases by other users, seller inventory updates, or system synchronization with third-party inventory sources. A ticket is not reserved, held, or confirmed as yours until your payment has been successfully processed and you have received an order confirmation from seats.ca. seats.ca is not liable for tickets that become unavailable during the browsing or checkout process. If a ticket becomes unavailable after you initiate but before you complete a purchase, no charge will be applied and no obligation to fulfill the order will arise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Ticket Purchases</h2>
            <p>All ticket purchases made through seats.ca are final and non-refundable unless otherwise required by applicable law or expressly stated in the listing. Ticket prices are set by the individual seller or reseller and are displayed in Canadian dollars (CAD). seats.ca does not set, control, or guarantee ticket prices. While we make every reasonable effort to ensure the accuracy of event information displayed on the Platform — including dates, times, venues, and opponent details — we cannot guarantee that this information is free from errors. In the event of an event cancellation, postponement, or venue change, the refund and exchange policies described in Section 7 below shall apply. seats.ca is not responsible for any losses, expenses, or inconvenience arising from event changes or cancellations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Event Cancellations, Postponements & Rescheduled Events</h2>
            <p className="mb-3">The following policies apply when events listed on the Platform are cancelled, postponed, or rescheduled:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Rescheduled Events:</strong> If an event is rescheduled to a new date and/or time, your tickets remain valid for the rescheduled event. No automatic refund will be issued for rescheduled events. It is the buyer's responsibility to check for updated event details. If you are unable to attend the rescheduled event, you may attempt to resell your tickets through the Platform, but seats.ca is under no obligation to provide a refund, exchange, or credit for rescheduled events.</li>
              <li><strong className="text-foreground">Cancelled Events:</strong> If an event is officially cancelled and will not be rescheduled, seats.ca will facilitate a refund to the buyer in accordance with the original payment method. Refund timelines may vary depending on the event organizer's policies and the payment processor's processing windows. seats.ca is not responsible for delays caused by third-party refund processes.</li>
              <li><strong className="text-foreground">Postponed Events (No New Date Announced):</strong> If an event is postponed indefinitely with no rescheduled date announced, tickets will remain valid pending a new date announcement. If the event is ultimately cancelled, the cancellation refund policy above will apply.</li>
              <li><strong className="text-foreground">Venue Changes:</strong> If an event is moved to a different venue, your tickets remain valid for the event at the new venue. Seat assignments may be subject to change at the discretion of the event organizer. seats.ca is not responsible for differences in seating, amenities, or experience between the original and replacement venue.</li>
            </ul>
            <p className="mt-3">seats.ca does not provide refunds for personal reasons, including but not limited to scheduling conflicts, travel difficulties, illness, weather conditions, or dissatisfaction with seating or venue. All refund decisions are made at the sole discretion of seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Venue Entry & Admission</h2>
            <p>seats.ca facilitates the sale of tickets but does not control or manage venue entry or admission. All venues, event organizers, and their authorized agents retain the absolute and sole right to refuse entry or eject any ticket holder at their discretion, regardless of whether the ticket is valid and authentic. Reasons for denied entry may include, but are not limited to, violation of venue policies, intoxication, disorderly conduct, possession of prohibited items, health and safety concerns, or any other reason determined by the venue or event organizer. seats.ca bears no responsibility or liability for denied entry, ejection, or any other actions taken by venue operators, security personnel, or event organizers. No refund, credit, or compensation will be issued by seats.ca for denied entry resulting from the venue's exercise of its admission policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Ticket Delivery</h2>
            <p>All tickets purchased through seats.ca are delivered electronically. Delivery methods may include, but are not limited to, email transfer, mobile ticket transfer, or direct download through the Platform. Sellers are required to deliver tickets within the timeframe specified in the listing. In the interest of buyer protection, seller payouts are processed after the event date to ensure that valid tickets have been delivered and the buyer has been able to attend the event. If a seller fails to deliver valid tickets as described in the listing, seats.ca may, at its discretion, issue a full refund to the buyer and take appropriate enforcement action against the seller's account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Seller Obligations & Resale Law Compliance</h2>
            <p>By listing tickets for sale on seats.ca, sellers represent and warrant that: (a) they are the rightful owner of the tickets or are authorized to sell them on behalf of the owner; (b) the tickets are valid, authentic, and have not been reported as lost, stolen, or previously used; (c) the tickets will be delivered to the buyer in a timely manner and in the format specified in the listing; (d) all information in the listing, including section, row, seat numbers, and any noted perks or inclusions, is accurate and not misleading; (e) the tickets have not been listed for sale on any other platform simultaneously in a manner that could result in overselling; and (f) the seller is in full compliance with all applicable federal, provincial, and municipal laws and regulations governing the resale of event tickets in the seller's jurisdiction and the jurisdiction in which the event takes place.</p>
            <p className="mt-3">seats.ca does not provide legal advice regarding ticket resale laws. Sellers are solely responsible for understanding and complying with all applicable resale legislation, including but not limited to the Ticket Sales Act (Ontario), the Amusement Act (Alberta), and any other provincial or federal laws regulating secondary ticket sales, pricing caps, disclosure requirements, and consumer protection obligations. Violation of any of these obligations may result in immediate account suspension, withholding of payment, permanent removal from the Platform, and referral to applicable law enforcement authorities. seats.ca shall not be held liable for any fines, penalties, legal proceedings, or damages arising from a seller's failure to comply with applicable resale laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Seller Data Responsibilities</h2>
            <p>When a ticket transaction is completed, sellers receive limited buyer information necessary to facilitate ticket delivery, as described in Section 4 of our Privacy Policy. This may include the buyer's name, email address, ticket quantity, and order confirmation number. Sellers agree that they: (a) will use buyer information solely for the purpose of completing the specific ticket transaction; (b) will not store, share, sell, or use buyer information for any other purpose, including marketing, profiling, or resale to third parties; (c) will delete buyer information once the transaction and ticket delivery are complete; and (d) will immediately notify seats.ca if buyer data has been inadvertently exposed or compromised. Misuse of buyer personal information is a material breach of these Terms and may result in immediate account termination, withholding of all pending payouts, and potential legal action.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Seller Penalties, Fines & Recovery of Losses</h2>
            <p className="mb-3">Sellers who breach these Terms, engage in fraudulent activity, or cause financial harm to seats.ca, its buyers, or the marketplace may be subject to the following remedies, individually or in combination, at seats.ca's sole discretion:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Withholding of Payouts:</strong> seats.ca may withhold, delay, or forfeit any pending or future payouts owed to the seller to offset losses, refunds issued to buyers, chargeback costs, or administrative expenses resulting from the seller's breach.</li>
              <li><strong className="text-foreground">Monetary Penalties:</strong> Sellers may be assessed monetary fines for violations including, but not limited to, failure to deliver tickets, listing fraudulent or invalid tickets, repeated inventory inaccuracies, overselling, or failure to comply with Platform policies. The amount of any fine will be proportionate to the severity and frequency of the violation and may be deducted from pending payouts or invoiced separately.</li>
              <li><strong className="text-foreground">Recovery of Losses:</strong> In the event that a seller's actions result in financial losses to seats.ca — including but not limited to chargebacks, buyer refunds, legal fees, administrative costs, and reputational damages — the seller agrees that seats.ca may recover such losses by deducting amounts from pending payouts, invoicing the seller directly, or pursuing collection through applicable legal channels.</li>
              <li><strong className="text-foreground">Account Suspension or Termination:</strong> Sellers in violation may have their accounts immediately suspended or permanently terminated. Terminated sellers forfeit all pending payouts if such payouts are needed to offset losses or refunds.</li>
            </ul>
            <p className="mt-3">By listing tickets on seats.ca, sellers acknowledge and agree to these enforcement mechanisms and waive any claim against seats.ca arising from the good-faith exercise of these remedies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Inventory Errors & Right to Cancel Transactions</h2>
            <p>seats.ca reserves the right to cancel any transaction and issue a full refund to the buyer if, in our sole judgment, the transaction involves: (a) a listing that contains a clear pricing error (e.g., tickets listed at $1 that are clearly worth significantly more, or vice versa); (b) duplicate or conflicting listings for the same seats; (c) inventory that has already been sold or is no longer available due to seller error; (d) a listing that materially misrepresents the tickets being sold, including incorrect section, row, seat numbers, or event details; or (e) any other circumstance in which fulfilling the transaction would be impractical, unjust, or harmful to the integrity of the marketplace.</p>
            <p className="mt-3">In such cases, the buyer will receive a full refund to their original payment method. The seller may be subject to penalties as described in Section 12. seats.ca is not liable for any damages, lost profits, or consequential losses arising from the cancellation of a transaction under this section.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Right to Cancel Suspicious Orders</h2>
            <p>seats.ca reserves the right to cancel, suspend, or reverse any order — before or after payment — if we reasonably believe that the order is associated with fraudulent, suspicious, or unauthorized activity. Indicators of suspicious activity include, but are not limited to: (a) use of stolen or unauthorized payment methods; (b) multiple orders placed in rapid succession from the same account or IP address; (c) mismatched billing and shipping information; (d) orders placed from high-risk IP addresses or known proxy/VPN services; (e) patterns consistent with bot activity or automated purchasing; (f) chargeback history associated with the account or payment method; or (g) any other activity that, in our sole judgment, poses a risk to the Platform, its users, or the integrity of the marketplace. In the event of a cancellation under this section, any payment collected will be refunded to the original payment method. seats.ca is not liable for any inconvenience, lost opportunity, or damages arising from the cancellation of a suspicious order.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. Reseller Program</h2>
            <p>seats.ca offers an authorized Reseller Program for businesses and individuals who wish to sell tickets at volume. Reseller accounts are subject to an application and approval process, and approved resellers must comply with all applicable reseller policies, including but not limited to pricing guidelines, inventory accuracy requirements, and league-specific restrictions. Resellers may upload ticket inventory individually or via CSV bulk import. Resellers may be required to provide additional personal and business information for identity verification (KYC), tax compliance, and regulatory purposes, as described in Section 5 of our Privacy Policy. Resellers are solely responsible for complying with all applicable tax laws in their jurisdiction, including the collection and remittance of applicable sales taxes. seats.ca does not provide tax advice. seats.ca reserves the right to revoke reseller status at any time for non-compliance, fraudulent activity, or conduct that undermines the integrity of the marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">16. Chargebacks & Payment Disputes</h2>
            <p className="mb-3">A chargeback (also known as a payment dispute) occurs when a buyer contacts their bank or credit card issuer to reverse a transaction. Chargebacks impose significant financial and administrative costs on seats.ca and its sellers. By using the Platform, you agree to the following:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Buyer Obligations:</strong> Before initiating a chargeback with your bank or credit card issuer, you agree to first contact seats.ca at info@seats.ca to attempt to resolve the issue directly. Filing a chargeback without first contacting seats.ca in good faith constitutes a material breach of these Terms.</li>
              <li><strong className="text-foreground">Prohibited Chargebacks:</strong> You agree not to initiate a chargeback for any transaction where: (a) valid tickets were delivered as described in the listing; (b) the event was rescheduled and your tickets remain valid; (c) you were denied entry for reasons unrelated to ticket validity (e.g., venue policy violations, intoxication); (d) you simply changed your mind, experienced a scheduling conflict, or chose not to attend; or (e) the dispute arises from a misunderstanding that could be resolved through our support channels.</li>
              <li><strong className="text-foreground">Chargeback Fees & Recovery:</strong> If a chargeback is filed against a transaction on the Platform, seats.ca reserves the right to: (a) recover all associated costs from the responsible party, including the chargeback amount, bank processing fees, administrative costs, and any penalties imposed by our payment processor; (b) immediately suspend the account of the user who initiated the chargeback pending investigation; (c) permanently ban the user if the chargeback is determined to be fraudulent or made in bad faith; and (d) pursue all available legal remedies, including but not limited to civil action for damages and reporting to fraud prevention databases.</li>
              <li><strong className="text-foreground">Seller Chargebacks:</strong> If a chargeback results from a seller's failure to deliver valid tickets, delivery of fraudulent tickets, or any other breach of seller obligations, the seller is fully responsible for all chargeback-related costs and losses. seats.ca may deduct these amounts from the seller's pending payouts or invoice the seller directly, as described in Section 12.</li>
              <li><strong className="text-foreground">Cooperation:</strong> Both buyers and sellers agree to cooperate fully with seats.ca and our payment processor in the investigation and resolution of any chargeback or payment dispute, including providing documentation, evidence of ticket delivery, and any other information reasonably requested.</li>
            </ul>
            <p className="mt-3">seats.ca reserves the right to report users who engage in serial or fraudulent chargebacks to fraud prevention databases, law enforcement agencies, and credit reporting services where permitted by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">17. Prohibited Conduct & Anti-Scraping</h2>
            <p className="mb-3">You agree not to: (a) use the Platform for any unlawful, fraudulent, or deceptive purpose; (b) list counterfeit, invalid, duplicate, or non-existent tickets; (c) attempt to circumvent, disable, or interfere with any security features of the Platform; (d) impersonate another person or entity, or falsely represent your affiliation with any person or entity; (e) engage in price manipulation, scalping beyond legally permitted limits, or any other form of market manipulation; (f) harass, threaten, or abuse other users, sellers, or seats.ca personnel; (g) use the Platform to transmit malware, viruses, or other harmful code; (h) misuse buyer or seller personal information obtained through the Platform; or (i) violate any applicable local, provincial, federal, or international law or regulation.</p>
            <p className="mt-3"><strong className="text-foreground">Anti-Scraping & Automated Access:</strong> You are expressly prohibited from using any automated means to access, scrape, crawl, harvest, mine, index, or extract any data, content, pricing, listing information, or other material from the Platform. This includes, but is not limited to, the use of bots, spiders, scrapers, crawlers, data mining tools, automated scripts, browser extensions, or any other automated technology or manual process designed to systematically collect data from the Platform. You may not reproduce, compile, aggregate, redistribute, or commercially exploit any data obtained from the Platform without our express written consent. Any unauthorized scraping, crawling, or automated access is a material violation of these Terms and may result in: (a) immediate and permanent ban from the Platform; (b) civil action for damages, including but not limited to statutory damages, lost revenue, and legal fees; (c) injunctive relief; and (d) criminal referral where applicable under the Criminal Code of Canada or other applicable law. seats.ca actively monitors for automated access and reserves the right to block any IP address, user agent, or access pattern that we reasonably believe is associated with scraping or automated data collection.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">18. Payment Processing & Verification</h2>
            <p>All payments on seats.ca are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. seats.ca does not store, process, or have direct access to your full credit card numbers or banking details. By completing a purchase, you authorize the applicable charge to your payment method. All prices are displayed and charged in Canadian dollars (CAD). You are responsible for any applicable taxes, including but not limited to Harmonized Sales Tax (HST) or Goods and Services Tax (GST), as determined by your province or territory of residence and the location of the event.</p>
            <p className="mt-3">We employ payment card evaluation systems and fraud detection tools to assess the legitimacy of transactions, as described in Section 3 of our Privacy Policy. These tools evaluate factors such as card origin, billing address verification, transaction velocity, and device fingerprinting. Based on these assessments, we reserve the right to: (a) decline a transaction; (b) request an alternative payment method; (c) require additional identity verification before processing a purchase; or (d) cancel a completed transaction if fraudulent activity is subsequently detected. These measures are designed to protect all users of the Platform and the integrity of the marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">19. Third-Party Services & APIs</h2>
            <p>The Platform relies on third-party application programming interfaces (APIs) and services for various features and functionality, including but not limited to payment processing, event scheduling data, AI-powered customer support, transportation integrations, email delivery, and cloud infrastructure, as described in detail in Section 11 of our Privacy Policy.</p>
            <p className="mt-3"><strong className="text-foreground">Disclaimer of Liability:</strong> seats.ca is not responsible for the availability, accuracy, reliability, security, or privacy practices of any third-party API provider or service integrated with the Platform. Third-party services are provided "as is" and are subject to those providers' own terms of service and privacy policies. seats.ca shall not be liable for any loss, damage, or inconvenience arising from: (a) outages, errors, or interruptions in third-party services; (b) inaccuracies in data provided by third-party APIs (including but not limited to event schedules, scores, or venue information); (c) data breaches or security incidents within a third-party provider's systems; (d) changes to a third-party provider's terms, pricing, or functionality; or (e) any actions taken by a third-party provider with respect to your data. Your use of any third-party service accessible through or linked from the Platform is at your own risk.</p>
            <p className="mt-3"><strong className="text-foreground">Third-Party Data Errors:</strong> Where event information, schedules, scores, team data, or other content is sourced from third-party APIs, seats.ca does not independently verify the accuracy of such data and accepts no responsibility for errors, omissions, or delays in third-party data. Any reliance on third-party data displayed on the Platform is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">20. Platform Availability & Service Interruptions</h2>
            <p>seats.ca strives to maintain continuous Platform availability but does not guarantee uninterrupted, error-free, or secure access at all times. The Platform may be temporarily unavailable due to scheduled maintenance, software updates, server outages, infrastructure failures, network issues, cyberattacks, third-party service disruptions, or other circumstances beyond our reasonable control. seats.ca shall not be liable for any loss, damage, inconvenience, or missed opportunity arising from Platform downtime, service interruptions, or degraded performance, including but not limited to: (a) inability to complete a ticket purchase during an outage or slowdown; (b) loss of items in a shopping cart or checkout session due to a system error or timeout; (c) delays in ticket delivery caused by Platform issues; (d) inaccurate or stale inventory data displayed during periods of degraded performance; or (e) any other disruption to the browsing, purchasing, or selling experience. You acknowledge that live ticket marketplaces operate in a time-sensitive environment and that seats.ca cannot guarantee the outcome of any transaction attempted during or immediately following a service interruption.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">21. Intellectual Property</h2>
            <p>All content on the Platform, including but not limited to the seats.ca name, logo, website design, page layouts, graphics, text, software, databases, ticket listings data, pricing data, and underlying code, is the exclusive property of seats.ca and is protected under Canadian and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from the Platform without our prior written consent. Team names, league logos, and related marks referenced on the Platform are the property of their respective owners and are used for identification purposes only. Their use does not imply endorsement by or affiliation with seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">22. Privacy & Data Protection</h2>
            <p>Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, disclose, and protect your personal information, including information about seller data sharing (Section 4), payment verification systems (Section 3), IP-based geolocation (Section 2), third-party API integrations (Section 11), data breach notification procedures (Section 8), and your rights under PIPEDA (Section 12). The Privacy Policy is incorporated into these Terms by reference. By using the Platform, you acknowledge that you have read and understood our Privacy Policy and consent to the practices described therein.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">23. Force Majeure</h2>
            <p>seats.ca shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond our reasonable control, including but not limited to: acts of God, natural disasters, pandemics, epidemics, public health emergencies, war, terrorism, civil unrest, government actions or orders, sanctions, embargoes, strikes, labor disputes, power outages, internet or telecommunications failures, cyberattacks, distributed denial-of-service (DDoS) attacks, fire, flood, earthquake, extreme weather events, or any other force majeure event. During any such event, our obligations under these Terms shall be suspended for the duration of the force majeure condition. If a force majeure event continues for more than ninety (90) consecutive days, either party may terminate the affected obligation without liability. For clarity, force majeure events affecting event organizers, venues, or teams (including event cancellations due to pandemics, natural disasters, or government orders) are governed by Section 7 above.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">24. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, seats.ca, its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform, including but not limited to loss of profits, data, goodwill, or other intangible losses. This limitation extends to damages arising from: the acts, omissions, or failures of any third-party service provider integrated with the Platform; Platform downtime or service interruptions; venue denial of entry; event cancellations, postponements, or rescheduling; third-party API data errors; or force majeure events. Our total aggregate liability for any claim arising from or related to these Terms or the Platform shall not exceed the greater of (a) the amount you paid to seats.ca for the specific transaction giving rise to the claim, or (b) fifty Canadian dollars (CAD $50.00). This limitation applies regardless of the legal theory under which the claim is brought, including contract, tort (including negligence), strict liability, or otherwise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">25. Disclaimer of Warranties</h2>
            <p>The Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. seats.ca does not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not guarantee admission to any event, the accuracy of any listing, the accuracy or availability of data provided by third-party APIs, continuous Platform availability, or the conduct of any buyer, seller, venue, or event organizer. You use the Platform at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">26. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless seats.ca, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from: (a) your use of or access to the Platform; (b) your violation of these Terms; (c) your violation of any third-party right, including without limitation any intellectual property, privacy, or proprietary right; (d) any claim that your listing or conduct on the Platform caused damage to a third party; (e) any misuse of personal information obtained through the Platform; (f) any chargeback initiated by you in bad faith or in violation of Section 16; (g) your failure to comply with applicable ticket resale laws; or (h) any dispute between you and another user of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">27. Dispute Resolution</h2>
            <p>In the event of a dispute arising from a ticket transaction, seats.ca encourages both parties to first attempt to resolve the matter directly. If a resolution cannot be reached, you may contact our support team at info@seats.ca for assistance. seats.ca reserves the right, but is not obligated, to mediate disputes between buyers and sellers. Any formal legal disputes arising out of or relating to these Terms shall be resolved through binding arbitration in accordance with the Arbitration Act (Ontario), unless otherwise required by applicable consumer protection law. Class action lawsuits and class-wide arbitrations are not permitted under these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">28. Termination</h2>
            <p>We reserve the right to suspend, restrict, or terminate your access to the Platform at any time, with or without cause or prior notice, including but not limited to cases of suspected fraud, violation of these Terms, filing of bad-faith chargebacks, misuse of personal information, scraping or automated access, or conduct that we determine is harmful to other users or to the integrity of the marketplace. Upon termination, your right to use the Platform will immediately cease. Any provisions of these Terms that by their nature should survive termination shall remain in effect, including but not limited to sections relating to chargebacks, seller penalties, intellectual property, limitation of liability, indemnification, privacy, force majeure, and governing law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">29. Governing Law</h2>
            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in the Province of Ontario for the resolution of any legal disputes arising out of or in connection with these Terms or your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">30. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable, while preserving the original intent of the parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">31. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy and any other legal notices or policies published on the Platform, constitute the entire agreement between you and seats.ca regarding your use of the Platform and supersede all prior agreements, understandings, and communications, whether written or oral, relating to the subject matter hereof.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">32. Contact</h2>
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
