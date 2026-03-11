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
            <h2 className="text-lg font-semibold text-foreground mb-2">5. seats.ca Buyer Guarantee</h2>
            <p className="mb-3">seats.ca is committed to providing a safe and trustworthy marketplace for Canadian sports fans. Our Buyer Guarantee provides the following protections on every qualifying purchase made through the Platform:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Valid Tickets or Your Money Back:</strong> Every ticket purchased through seats.ca is guaranteed to be valid and authentic. If you receive tickets that are fraudulent, counterfeit, or otherwise invalid and are denied entry to the event solely due to ticket invalidity, seats.ca will provide a full refund or, where possible, comparable replacement tickets at our discretion.</li>
              <li><strong className="text-foreground">Timely Delivery:</strong> Tickets will be delivered electronically before the event. If a seller fails to deliver tickets by the time specified in the listing, seats.ca will work to source comparable replacement tickets or issue a full refund.</li>
              <li><strong className="text-foreground">Tickets as Described:</strong> Tickets will be for the section, row, and seats described in the listing. If the delivered tickets materially differ from the listing description (e.g., wrong section, fewer seats than purchased), seats.ca will provide a refund for the difference, source replacement tickets, or issue a full refund at our discretion.</li>
            </ul>
            <p className="mt-3"><strong className="text-foreground">Exclusions:</strong> The Buyer Guarantee does not apply in the following circumstances: (a) denied entry due to venue policy violations, personal conduct, or reasons unrelated to ticket validity (see Section 9); (b) event cancellations, postponements, or rescheduling (see Section 8); (c) dissatisfaction with seating view, venue amenities, or the event experience; (d) tickets purchased outside the Platform or through unofficial channels; (e) claims submitted more than 48 hours after the event date; or (f) situations where the buyer has initiated a chargeback without first contacting seats.ca (see Section 18). To make a claim under the Buyer Guarantee, contact info@seats.ca with your order number, event details, and supporting documentation within 48 hours of the event.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Dynamic Inventory & Ticket Availability</h2>
            <p>All ticket listings on seats.ca are part of a dynamic, real-time inventory system. Ticket availability displayed on the Platform is indicative only and does not constitute a guarantee that a specific ticket, section, row, or seat is available for purchase. Inventory may change at any moment due to simultaneous purchases by other users, seller inventory updates, or system synchronization with third-party inventory sources. A ticket is not reserved, held, or confirmed as yours until your payment has been successfully processed and you have received an order confirmation from seats.ca. seats.ca is not liable for tickets that become unavailable during the browsing or checkout process. If a ticket becomes unavailable after you initiate but before you complete a purchase, no charge will be applied and no obligation to fulfill the order will arise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Ticket Purchases & Refund Exceptions</h2>
            <p className="mb-3">All ticket purchases made through seats.ca are final and non-refundable unless otherwise required by applicable law, covered by the Buyer Guarantee (Section 5), or expressly stated in the listing. Ticket prices are set by the individual seller or reseller and are displayed in Canadian dollars (CAD). seats.ca does not set, control, or guarantee ticket prices.</p>
            <p className="mb-3"><strong className="text-foreground">Refunds Will Not Be Issued For:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Change of mind, scheduling conflicts, or inability to attend for personal reasons</li>
              <li>Travel disruptions, illness, or weather conditions</li>
              <li>Dissatisfaction with seating view, venue amenities, or the event experience</li>
              <li>Partial event attendance (e.g., arriving late or leaving early)</li>
              <li>Denied entry due to personal conduct or violation of venue policies</li>
              <li>Rescheduled events where the original tickets remain valid (see Section 8)</li>
              <li>Price drops or fluctuations after purchase</li>
            </ul>
            <p className="mt-3">Refunds, where applicable, are processed to the original payment method. Processing times depend on your financial institution and are typically 5–10 business days. All refund decisions are final and made at the sole discretion of seats.ca in accordance with these Terms and applicable law, including the Ontario Consumer Protection Act, 2002 where applicable.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Event Cancellations, Postponements & Rescheduled Events</h2>
            <p className="mb-3">The following policies apply when events listed on the Platform are cancelled, postponed, or rescheduled:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Rescheduled Events:</strong> If an event is rescheduled to a new date and/or time, your tickets remain valid for the rescheduled event. No automatic refund will be issued for rescheduled events. It is the buyer's responsibility to check for updated event details. If you are unable to attend the rescheduled event, you may attempt to resell your tickets through the Platform, but seats.ca is under no obligation to provide a refund, exchange, or credit for rescheduled events.</li>
              <li><strong className="text-foreground">Cancelled Events:</strong> If an event is officially cancelled and will not be rescheduled, seats.ca will facilitate a refund to the buyer in accordance with the original payment method. Refund timelines may vary depending on the event organizer's policies and the payment processor's processing windows. seats.ca is not responsible for delays caused by third-party refund processes.</li>
              <li><strong className="text-foreground">Postponed Events (No New Date Announced):</strong> If an event is postponed indefinitely with no rescheduled date announced, tickets will remain valid pending a new date announcement. If the event is ultimately cancelled, the cancellation refund policy above will apply.</li>
              <li><strong className="text-foreground">Venue Changes:</strong> If an event is moved to a different venue, your tickets remain valid for the event at the new venue. Seat assignments may be subject to change at the discretion of the event organizer. seats.ca is not responsible for differences in seating, amenities, or experience between the original and replacement venue.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Venue Entry & Admission</h2>
            <p>seats.ca facilitates the sale of tickets but does not control or manage venue entry or admission. All venues, event organizers, and their authorized agents retain the absolute and sole right to refuse entry or eject any ticket holder at their discretion, regardless of whether the ticket is valid and authentic. Reasons for denied entry may include, but are not limited to, violation of venue policies, intoxication, disorderly conduct, possession of prohibited items, health and safety concerns, or any other reason determined by the venue or event organizer. seats.ca bears no responsibility or liability for denied entry, ejection, or any other actions taken by venue operators, security personnel, or event organizers. No refund, credit, or compensation will be issued by seats.ca for denied entry resulting from the venue's exercise of its admission policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Ticket Delivery</h2>
            <p>All tickets purchased through seats.ca are delivered electronically. Delivery methods may include, but are not limited to, email transfer, mobile ticket transfer, or direct download through the Platform. Sellers are required to deliver tickets within the timeframe specified in the listing. In the interest of buyer protection, seller payouts are processed after the event date to ensure that valid tickets have been delivered and the buyer has been able to attend the event. If a seller fails to deliver valid tickets as described in the listing, the Buyer Guarantee (Section 5) applies, and seats.ca may issue a full refund and take appropriate enforcement action against the seller's account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Ticket Ownership Representation</h2>
            <p>By listing tickets for sale on seats.ca, sellers represent and warrant under penalty of account termination and legal action that: (a) they are the legal and rightful owner of the tickets, or have obtained explicit, documented authorization from the rightful owner to sell the tickets on their behalf; (b) the tickets are genuine, unaltered, and have not been duplicated, counterfeited, or obtained through unauthorized means; (c) the tickets have not been reported as lost, stolen, voided, or previously transferred or redeemed; (d) the seller has physical or electronic possession of the tickets at the time of listing and is able to deliver them immediately upon sale; (e) the tickets are free of any liens, encumbrances, restrictions, or conditions that would prevent the buyer from using them for entry to the event; and (f) the seller has not and will not transfer, sell, or assign the same tickets to any other party through any channel after listing them on seats.ca. Any breach of these representations constitutes fraud and may result in immediate account termination, forfeiture of all payouts, referral to law enforcement, and civil action for damages.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Prohibition on Overselling & Speculative Ticketing</h2>
            <p>Sellers are strictly prohibited from listing tickets that they do not currently own or possess ("speculative ticketing" or "short selling"). This includes, but is not limited to: (a) listing tickets that the seller intends to acquire after the sale is made; (b) listing tickets based on the expectation that they will become available in the future; (c) listing tickets from a season ticket package or subscription that has not yet been confirmed or allocated; (d) listing tickets that are pending transfer from another party; or (e) listing tickets for events that have not yet had tickets officially released. All tickets listed on seats.ca must be in the seller's actual possession or under their verifiable control at the time the listing is published. Violation of this policy is a material breach of these Terms and will result in: immediate and permanent account termination; forfeiture of all pending and future payouts; full refunds to any affected buyers at the seller's expense; recovery of all associated costs including chargebacks, administrative fees, and buyer compensation; and potential legal action for fraud. seats.ca actively monitors for patterns of speculative ticketing and reserves the right to require sellers to provide proof of ticket possession before a listing is published or a payout is released.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Seller Obligations & Resale Law Compliance</h2>
            <p>By listing tickets for sale on seats.ca, sellers agree to comply with all obligations set forth in these Terms, including but not limited to ticket ownership (Section 11), prohibition on overselling (Section 12), data responsibilities (Section 14), and all applicable laws.</p>
            <p className="mt-3">seats.ca does not provide legal advice regarding ticket resale laws. Sellers are solely responsible for understanding and complying with all applicable federal, provincial, and municipal resale legislation, including but not limited to the Ticket Sales Act (Ontario), the Amusement Act (Alberta), the Consumer Protection Act (British Columbia), and any other laws regulating secondary ticket sales, pricing caps, disclosure requirements, face value restrictions, and consumer protection obligations. This includes compliance with any requirements to disclose the original face value of tickets, the seller's identity, and the location of seats. Violation of any of these obligations may result in immediate account suspension, withholding of payment, permanent removal from the Platform, and referral to applicable law enforcement or consumer protection authorities. seats.ca shall not be held liable for any fines, penalties, legal proceedings, or damages arising from a seller's failure to comply with applicable resale laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Seller Data Responsibilities</h2>
            <p>When a ticket transaction is completed, sellers receive limited buyer information necessary to facilitate ticket delivery, as described in Section 4 of our Privacy Policy. This may include the buyer's name, email address, ticket quantity, and order confirmation number. Sellers agree that they: (a) will use buyer information solely for the purpose of completing the specific ticket transaction; (b) will not store, share, sell, or use buyer information for any other purpose, including marketing, profiling, or resale to third parties; (c) will delete buyer information once the transaction and ticket delivery are complete; and (d) will immediately notify seats.ca if buyer data has been inadvertently exposed or compromised. Misuse of buyer personal information is a material breach of these Terms and may result in immediate account termination, withholding of all pending payouts, and potential legal action.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. Seller Penalties, Fines & Recovery of Losses</h2>
            <p className="mb-3">Sellers who breach these Terms, engage in fraudulent activity, or cause financial harm to seats.ca, its buyers, or the marketplace may be subject to the following remedies, individually or in combination, at seats.ca's sole discretion:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Withholding of Payouts:</strong> seats.ca may withhold, delay, or forfeit any pending or future payouts owed to the seller to offset losses, refunds issued to buyers, chargeback costs, or administrative expenses resulting from the seller's breach.</li>
              <li><strong className="text-foreground">Monetary Penalties:</strong> Sellers may be assessed monetary fines for violations including, but not limited to, failure to deliver tickets, listing fraudulent or invalid tickets, speculative ticketing, repeated inventory inaccuracies, overselling, or failure to comply with Platform policies. The amount of any fine will be proportionate to the severity and frequency of the violation and may be deducted from pending payouts or invoiced separately.</li>
              <li><strong className="text-foreground">Recovery of Losses:</strong> In the event that a seller's actions result in financial losses to seats.ca — including but not limited to chargebacks, buyer refunds, Buyer Guarantee claims, legal fees, administrative costs, and reputational damages — the seller agrees that seats.ca may recover such losses by deducting amounts from pending payouts, invoicing the seller directly, or pursuing collection through applicable legal channels. Sellers acknowledge that their liability is not limited to the value of the tickets sold and may include consequential costs incurred by seats.ca.</li>
              <li><strong className="text-foreground">Account Suspension or Termination:</strong> Sellers in violation may have their accounts immediately suspended or permanently terminated. Terminated sellers forfeit all pending payouts if such payouts are needed to offset losses or refunds.</li>
              <li><strong className="text-foreground">Legal Action & Reporting:</strong> seats.ca reserves the right to pursue civil legal action and/or report sellers to law enforcement, consumer protection agencies, and fraud prevention databases for serious violations including fraud, speculative ticketing, and repeat offenses.</li>
            </ul>
            <p className="mt-3">By listing tickets on seats.ca, sellers acknowledge and agree to these enforcement mechanisms and waive any claim against seats.ca arising from the good-faith exercise of these remedies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">16. Inventory Errors & Right to Cancel Transactions</h2>
            <p>seats.ca reserves the right to cancel any transaction and issue a full refund to the buyer if, in our sole judgment, the transaction involves: (a) a listing that contains a clear pricing error (e.g., tickets listed at $1 that are clearly worth significantly more, or vice versa); (b) duplicate or conflicting listings for the same seats; (c) inventory that has already been sold or is no longer available due to seller error; (d) a listing that materially misrepresents the tickets being sold, including incorrect section, row, seat numbers, or event details; (e) speculative or unconfirmed inventory; or (f) any other circumstance in which fulfilling the transaction would be impractical, unjust, or harmful to the integrity of the marketplace.</p>
            <p className="mt-3">Additionally, seats.ca reserves the right, at its sole discretion, to cancel any sale or transaction for any reason, including but not limited to operational concerns, platform integrity issues, suspected policy violations, or circumstances where completing the transaction would not be in the best interest of the marketplace or its users. This right applies before, during, or after payment processing and is not limited to the specific circumstances listed above.</p>
            <p className="mt-3">In such cases, the buyer will receive a full refund to their original payment method. The seller may be subject to penalties as described in Section 15. seats.ca is not liable for any damages, lost profits, or consequential losses arising from the cancellation of a transaction under this section. Neither buyers nor sellers may claim entitlement to specific performance of a cancelled order.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">17. Right to Cancel Suspicious Orders</h2>
            <p>seats.ca reserves the right to cancel, suspend, or reverse any order — before or after payment — if we reasonably believe that the order is associated with fraudulent, suspicious, or unauthorized activity. Indicators of suspicious activity include, but are not limited to: (a) use of stolen or unauthorized payment methods; (b) multiple orders placed in rapid succession from the same account or IP address; (c) mismatched billing and shipping information; (d) orders placed from high-risk IP addresses or known proxy/VPN services; (e) patterns consistent with bot activity or automated purchasing; (f) chargeback history associated with the account or payment method; or (g) any other activity that, in our sole judgment, poses a risk to the Platform, its users, or the integrity of the marketplace. In the event of a cancellation under this section, any payment collected will be refunded to the original payment method. seats.ca is not liable for any inconvenience, lost opportunity, or damages arising from the cancellation of a suspicious order.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">18. Chargebacks & Payment Disputes</h2>
            <p className="mb-3">A chargeback (also known as a payment dispute) occurs when a buyer contacts their bank or credit card issuer to reverse a transaction. Chargebacks impose significant financial and administrative costs on seats.ca and its sellers. By using the Platform, you agree to the following:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Mandatory Pre-Dispute Resolution:</strong> Before initiating a chargeback with your bank or credit card issuer, you are required to first contact seats.ca at info@seats.ca and allow a minimum of five (5) business days for resolution. Filing a chargeback without first contacting seats.ca and exhausting our internal resolution process constitutes a material breach of these Terms and may result in account termination and legal action.</li>
              <li><strong className="text-foreground">Prohibited Chargebacks:</strong> You agree not to initiate a chargeback for any transaction where: (a) valid tickets were delivered as described in the listing; (b) the event was rescheduled and your tickets remain valid; (c) you were denied entry for reasons unrelated to ticket validity (e.g., venue policy violations, intoxication, personal conduct); (d) you simply changed your mind, experienced a scheduling conflict, or chose not to attend; (e) the dispute arises from a misunderstanding that could be resolved through our support channels; or (f) your claim is excluded under the Buyer Guarantee (Section 5). Filing a chargeback under any of these circumstances constitutes a fraudulent or bad-faith chargeback.</li>
              <li><strong className="text-foreground">Chargeback Fees & Recovery:</strong> If a chargeback is filed against a transaction on the Platform, seats.ca reserves the right to: (a) recover all associated costs from the responsible party, including the chargeback amount, bank processing fees (typically $15–$25 per chargeback), administrative investigation costs, and any penalties imposed by our payment processor; (b) immediately suspend the account of the user who initiated the chargeback pending investigation; (c) permanently ban the user and all associated accounts if the chargeback is determined to be fraudulent or made in bad faith; (d) pursue all available legal remedies, including civil action for damages, costs of collection, and reasonable legal fees; and (e) report the user to fraud prevention databases and credit reporting services where permitted by law.</li>
              <li><strong className="text-foreground">Seller Chargebacks:</strong> If a chargeback results from a seller's failure to deliver valid tickets, delivery of fraudulent or speculative tickets, or any other breach of seller obligations, the seller is fully responsible for all chargeback-related costs and losses, including the refund amount, processing fees, and administrative costs. seats.ca may deduct these amounts from the seller's pending payouts or invoice the seller directly, as described in Section 15.</li>
              <li><strong className="text-foreground">Cooperation:</strong> Both buyers and sellers agree to cooperate fully with seats.ca and our payment processor in the investigation and resolution of any chargeback or payment dispute, including providing documentation, evidence of ticket delivery, screenshots, email records, and any other information reasonably requested within the timeframe specified.</li>
            </ul>
            <p className="mt-3">seats.ca maintains detailed records of all transactions, communications, and ticket deliveries. These records may be submitted to payment processors, financial institutions, and courts as evidence in chargeback disputes. Users who engage in serial, fraudulent, or bad-faith chargebacks may be reported to law enforcement agencies and fraud prevention databases.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">19. Reseller Program</h2>
            <p>seats.ca offers an authorized Reseller Program for businesses and individuals who wish to sell tickets at volume. Reseller accounts are subject to an application and approval process, and approved resellers must comply with all applicable reseller policies, including but not limited to pricing guidelines, inventory accuracy requirements, and league-specific restrictions. Resellers may upload ticket inventory individually or via CSV bulk import. Resellers may be required to provide additional personal and business information for identity verification (KYC), tax compliance, and regulatory purposes, as described in Section 5 of our Privacy Policy. Resellers are solely responsible for complying with all applicable tax laws in their jurisdiction, including the collection and remittance of applicable sales taxes. seats.ca does not provide tax advice. seats.ca reserves the right to revoke reseller status at any time for non-compliance, fraudulent activity, or conduct that undermines the integrity of the marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">20. Tax Obligations</h2>
            <p>All users of the Platform are solely responsible for determining and fulfilling their own tax obligations arising from the purchase or sale of tickets through seats.ca. This includes, but is not limited to: (a) the collection and remittance of applicable Harmonized Sales Tax (HST), Goods and Services Tax (GST), Provincial Sales Tax (PST), or Québec Sales Tax (QST) on ticket sales; (b) income tax reporting for profits earned from ticket resale; (c) any tax withholding, information reporting, or filing requirements imposed by the Canada Revenue Agency (CRA) or provincial tax authorities; and (d) compliance with any tax obligations in jurisdictions outside of Canada if selling or purchasing tickets for events in other countries. seats.ca does not collect or remit sales tax on behalf of sellers unless expressly required by law. seats.ca does not provide tax, legal, or accounting advice. Sellers who reach certain sales thresholds may be required to provide their Business Number (BN), GST/HST registration number, or other tax identification as part of our seller verification process. Failure to comply with applicable tax laws is the sole responsibility of the user, and seats.ca shall not be liable for any taxes, penalties, interest, or assessments arising from a user's failure to meet their tax obligations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">21. Prohibited Conduct & Anti-Scraping</h2>
            <p className="mb-3">You agree not to: (a) use the Platform for any unlawful, fraudulent, or deceptive purpose; (b) list counterfeit, invalid, duplicate, or non-existent tickets; (c) engage in speculative ticketing or overselling; (d) attempt to circumvent, disable, or interfere with any security features of the Platform; (e) impersonate another person or entity, or falsely represent your affiliation with any person or entity; (f) engage in price manipulation, scalping beyond legally permitted limits, or any other form of market manipulation; (g) harass, threaten, or abuse other users, sellers, or seats.ca personnel; (h) use the Platform to transmit malware, viruses, or other harmful code; (i) misuse buyer or seller personal information obtained through the Platform; (j) file fraudulent or bad-faith chargebacks; or (k) violate any applicable local, provincial, federal, or international law or regulation.</p>
            <p className="mt-3"><strong className="text-foreground">Anti-Scraping & Automated Access:</strong> You are expressly prohibited from using any automated means to access, scrape, crawl, harvest, mine, index, or extract any data, content, pricing, listing information, or other material from the Platform. This includes, but is not limited to, the use of bots, spiders, scrapers, crawlers, data mining tools, automated scripts, browser extensions, or any other automated technology or manual process designed to systematically collect data from the Platform. You may not reproduce, compile, aggregate, redistribute, or commercially exploit any data obtained from the Platform without our express written consent. Any unauthorized scraping, crawling, or automated access is a material violation of these Terms and may result in: (a) immediate and permanent ban from the Platform; (b) civil action for damages, including but not limited to statutory damages, lost revenue, and legal fees; (c) injunctive relief; and (d) criminal referral where applicable under the Criminal Code of Canada or other applicable law. seats.ca actively monitors for automated access and reserves the right to block any IP address, user agent, or access pattern that we reasonably believe is associated with scraping or automated data collection.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">22. Payment Processing & Verification</h2>
            <p>All payments on seats.ca are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. seats.ca does not store, process, or have direct access to your full credit card numbers or banking details. By completing a purchase, you authorize the applicable charge to your payment method. All prices are displayed and charged in Canadian dollars (CAD). You are responsible for any applicable taxes as described in Section 20.</p>
            <p className="mt-3">We employ payment card evaluation systems and fraud detection tools to assess the legitimacy of transactions, as described in Section 3 of our Privacy Policy. These tools evaluate factors such as card origin, billing address verification, transaction velocity, and device fingerprinting. Based on these assessments, we reserve the right to: (a) decline a transaction; (b) request an alternative payment method; (c) require additional identity verification before processing a purchase; or (d) cancel a completed transaction if fraudulent activity is subsequently detected. These measures are designed to protect all users of the Platform and the integrity of the marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">23. Third-Party Services & APIs</h2>
            <p>The Platform relies on third-party application programming interfaces (APIs) and services for various features and functionality, including but not limited to payment processing, event scheduling data, AI-powered customer support, transportation integrations, email delivery, and cloud infrastructure, as described in detail in Section 11 of our Privacy Policy.</p>
            <p className="mt-3"><strong className="text-foreground">Disclaimer of Liability:</strong> seats.ca is not responsible for the availability, accuracy, reliability, security, or privacy practices of any third-party API provider or service integrated with the Platform. Third-party services are provided "as is" and are subject to those providers' own terms of service and privacy policies. seats.ca shall not be liable for any loss, damage, or inconvenience arising from: (a) outages, errors, or interruptions in third-party services; (b) inaccuracies in data provided by third-party APIs (including but not limited to event schedules, scores, or venue information); (c) data breaches or security incidents within a third-party provider's systems; (d) changes to a third-party provider's terms, pricing, or functionality; or (e) any actions taken by a third-party provider with respect to your data. Your use of any third-party service accessible through or linked from the Platform is at your own risk.</p>
            <p className="mt-3"><strong className="text-foreground">Third-Party Data Errors:</strong> Where event information, schedules, scores, team data, or other content is sourced from third-party APIs, seats.ca does not independently verify the accuracy of such data and accepts no responsibility for errors, omissions, or delays in third-party data. Any reliance on third-party data displayed on the Platform is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">24. Mobile Applications & Third-Party Platform Terms</h2>
            <p className="mb-3">If you access the Platform through a mobile application or any third-party platform (including but not limited to the Apple App Store, Google Play Store, or any progressive web application), the following additional terms apply:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Platform Provider Terms:</strong> Your use of the mobile application is also subject to the terms and conditions of the applicable platform provider (e.g., Apple Inc., Google LLC). In the event of a conflict between these Terms and a platform provider's terms, these Terms shall govern the relationship between you and seats.ca, except where the platform provider's terms are required by law to take precedence.</li>
              <li><strong className="text-foreground">No Platform Provider Liability:</strong> The platform provider (e.g., Apple, Google) is not a party to these Terms and has no obligation to provide maintenance, support, warranty, or any other service with respect to the seats.ca application. seats.ca, not the platform provider, is solely responsible for the application and its content.</li>
              <li><strong className="text-foreground">Third-Party Beneficiary:</strong> Apple Inc. and its subsidiaries are third-party beneficiaries of these Terms as they relate to your use of the iOS application and shall have the right to enforce these Terms against you as a third-party beneficiary.</li>
              <li><strong className="text-foreground">Device Permissions:</strong> The mobile application may request access to certain device features (e.g., notifications, camera for scanning tickets, location services). Granting these permissions is voluntary, though certain features may not function without them. You can manage permissions through your device settings at any time.</li>
              <li><strong className="text-foreground">Push Notifications:</strong> If you enable push notifications, we may send you alerts about order updates, ticket delivery, event reminders, price changes, and promotional offers. You can disable push notifications through your device settings at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">25. Platform Availability & Service Interruptions</h2>
            <p>seats.ca strives to maintain continuous Platform availability but does not guarantee uninterrupted, error-free, or secure access at all times. The Platform may be temporarily unavailable due to scheduled maintenance, software updates, server outages, infrastructure failures, network issues, cyberattacks, third-party service disruptions, or other circumstances beyond our reasonable control. seats.ca shall not be liable for any loss, damage, inconvenience, or missed opportunity arising from Platform downtime, service interruptions, or degraded performance, including but not limited to: (a) inability to complete a ticket purchase during an outage or slowdown; (b) loss of items in a shopping cart or checkout session due to a system error or timeout; (c) delays in ticket delivery caused by Platform issues; (d) inaccurate or stale inventory data displayed during periods of degraded performance; or (e) any other disruption to the browsing, purchasing, or selling experience. You acknowledge that live ticket marketplaces operate in a time-sensitive environment and that seats.ca cannot guarantee the outcome of any transaction attempted during or immediately following a service interruption.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">26. International Sales & Cross-Border Transactions</h2>
            <p>seats.ca primarily serves the Canadian market. However, users outside of Canada may access and use the Platform subject to the following conditions: (a) you are solely responsible for compliance with all laws and regulations applicable in your jurisdiction regarding the purchase, sale, and resale of event tickets; (b) seats.ca makes no representation that tickets sold on the Platform are suitable or available for use outside of Canada; (c) all prices are in Canadian dollars (CAD), and any currency conversion fees or exchange rate differences are your sole responsibility; (d) international payment methods may be subject to additional fraud verification and may be declined at our discretion; (e) seats.ca is not responsible for any customs, import duties, taxes, or regulatory requirements that may apply to cross-border ticket transactions; and (f) your personal information may be transferred to and processed in Canada in accordance with our Privacy Policy and Canadian privacy laws. seats.ca does not guarantee that tickets purchased for events in other countries will be honoured by international venues, and we disclaim any liability arising from cross-border ticket issues.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">27. Intellectual Property</h2>
            <p>All content on the Platform, including but not limited to the seats.ca name, logo, website design, page layouts, graphics, text, software, databases, ticket listings data, pricing data, and underlying code, is the exclusive property of seats.ca and is protected under Canadian and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works from, publicly display, or commercially exploit any content from the Platform without our prior written consent. Team names, league logos, and related marks referenced on the Platform are the property of their respective owners and are used for identification purposes only. Their use does not imply endorsement by or affiliation with seats.ca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">28. Privacy & Data Protection</h2>
            <p>Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, disclose, and protect your personal information, including information about seller data sharing (Section 4), payment verification systems (Section 3), IP-based geolocation (Section 2), identity verification (Section 2), third-party API integrations (Section 11), data breach notification procedures (Section 8), and your rights under PIPEDA (Section 12). The Privacy Policy is incorporated into these Terms by reference. By using the Platform, you acknowledge that you have read and understood our Privacy Policy and consent to the practices described therein.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">29. Force Majeure</h2>
            <p>seats.ca shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond our reasonable control, including but not limited to: acts of God, natural disasters, pandemics, epidemics, public health emergencies, war, terrorism, civil unrest, government actions or orders, sanctions, embargoes, strikes, labor disputes, power outages, internet or telecommunications failures, cyberattacks, distributed denial-of-service (DDoS) attacks, fire, flood, earthquake, extreme weather events, or any other force majeure event. During any such event, our obligations under these Terms shall be suspended for the duration of the force majeure condition. If a force majeure event continues for more than ninety (90) consecutive days, either party may terminate the affected obligation without liability. For clarity, force majeure events affecting event organizers, venues, or teams (including event cancellations due to pandemics, natural disasters, or government orders) are governed by Section 8 above.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">30. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, seats.ca, its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Platform, including but not limited to loss of profits, data, goodwill, or other intangible losses. This limitation extends to damages arising from: the acts, omissions, or failures of any third-party service provider integrated with the Platform; Platform downtime or service interruptions; venue denial of entry; event cancellations, postponements, or rescheduling; third-party API data errors; cross-border transaction issues; or force majeure events. Our total aggregate liability for any claim arising from or related to these Terms or the Platform shall not exceed the greater of (a) the amount you paid to seats.ca for the specific transaction giving rise to the claim, or (b) fifty Canadian dollars (CAD $50.00). This limitation applies regardless of the legal theory under which the claim is brought, including contract, tort (including negligence), strict liability, or otherwise.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">31. Disclaimer of Warranties</h2>
            <p>The Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. seats.ca does not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components. We do not guarantee admission to any event, the accuracy of any listing, the accuracy or availability of data provided by third-party APIs, continuous Platform availability, the conduct of any buyer, seller, venue, or event organizer, or the validity of tickets in jurisdictions outside of Canada. You use the Platform at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">32. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless seats.ca, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from: (a) your use of or access to the Platform; (b) your violation of these Terms; (c) your violation of any third-party right, including without limitation any intellectual property, privacy, or proprietary right; (d) any claim that your listing or conduct on the Platform caused damage to a third party; (e) any misuse of personal information obtained through the Platform; (f) any chargeback initiated by you in bad faith or in violation of Section 18; (g) your failure to comply with applicable ticket resale laws or tax obligations; (h) speculative ticketing or overselling; or (i) any dispute between you and another user of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">33. Dispute Resolution & Arbitration</h2>
            <p className="mb-3">In the event of a dispute arising from a ticket transaction or your use of the Platform, the following process applies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Step 1 — Direct Resolution:</strong> You agree to first attempt to resolve the dispute directly with the other party involved.</li>
              <li><strong className="text-foreground">Step 2 — seats.ca Mediation:</strong> If direct resolution fails, you may contact our support team at info@seats.ca. seats.ca reserves the right, but is not obligated, to mediate disputes between buyers and sellers. seats.ca's decision in any mediated dispute shall be final and binding on both parties.</li>
              <li><strong className="text-foreground">Step 3 — Binding Arbitration:</strong> Any formal legal dispute arising out of or relating to these Terms that cannot be resolved through mediation shall be resolved through binding arbitration administered in accordance with the Arbitration Act, 1991 (Ontario), conducted by a single arbitrator in the City of Toronto, Ontario. The arbitrator's decision shall be final, binding, and enforceable in any court of competent jurisdiction.</li>
            </ul>
            <p className="mt-3"><strong className="text-foreground">Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You hereby waive your right to participate in a class action lawsuit or class-wide arbitration against seats.ca. If this class action waiver is found to be unenforceable, the entirety of this arbitration provision shall be null and void.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">34. Termination</h2>
            <p>We reserve the right to suspend, restrict, or terminate your access to the Platform at any time, with or without cause or prior notice, including but not limited to cases of suspected fraud, violation of these Terms, filing of bad-faith chargebacks, speculative ticketing, misuse of personal information, scraping or automated access, violation of resale laws, or conduct that we determine is harmful to other users or to the integrity of the marketplace. Upon termination, your right to use the Platform will immediately cease. Any provisions of these Terms that by their nature should survive termination shall remain in effect, including but not limited to sections relating to the Buyer Guarantee, chargebacks, seller penalties, intellectual property, limitation of liability, indemnification, privacy, force majeure, arbitration, and governing law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">35. Governing Law</h2>
            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the Province of Ontario and the federal laws of Canada applicable therein, without regard to conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in the Province of Ontario for the resolution of any legal disputes arising out of or in connection with these Terms or your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">36. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable, while preserving the original intent of the parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">37. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy and any other legal notices or policies published on the Platform, constitute the entire agreement between you and seats.ca regarding your use of the Platform and supersede all prior agreements, understandings, and communications, whether written or oral, relating to the subject matter hereof.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">38. Contact</h2>
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
