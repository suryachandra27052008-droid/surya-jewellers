import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | Surya Jewellers' },
  description: 'Terms for purchases, payments, ring sizes, shipping, returns and use of the Surya Jewellers website, including statutory consumer rights.',
  alternates: { canonical: 'https://www.suryajewellers.com/terms' },
};

const sections = [
  {
    title: 'Shopping With Us',
    paragraphs: [
      'These terms apply to purchases from Surya Jewellers through suryajewellers.com and use of our website. Purchases must be made by someone legally able to enter into a contract. Please provide accurate contact and delivery details so we can process your order and contact you if necessary.',
      'Product-specific information and any written terms agreed for a custom or wholesale order form part of that order. Mandatory consumer rights take priority over any conflicting website policy or term.',
    ],
  },
  {
    title: 'Products and Ring Sizes',
    paragraphs: [
      'Check the product description, material, measurements, availability and selected options before paying. Photographs and screen colours may differ slightly from the physical piece, and natural stones may vary. This does not excuse supplying an incorrect, defective or materially misdescribed item.',
      'Ring sizes on the website use the Indian sizing system. Please check your selected size and our size guide before placing your order. Any special sizing, engraving or other custom work must be agreed with us; selecting a standard listed size does not by itself remove statutory return rights.',
      'Certification, maintenance and other product benefits apply only where expressly stated for the particular item or agreed in writing. These terms do not create an additional certification or warranty promise.',
    ],
  },
  {
    title: 'Prices, Payments and Order Confirmation',
    paragraphs: [
      'Review the items, quantities, currency, discounts, shipping charges and final total shown at checkout. Currency conversions use the store rates displayed through the website, not a promise of the current interbank rate. Your bank or payment provider may apply its own conversion or transaction charges.',
      'Payments are processed through the provider selected at checkout. An authorisation or payment-provider receipt alone does not confirm dispatch. We verify payment and availability before fulfilling an order. Keep your order reference and contact us if payment has been taken but an order confirmation is missing.',
      'If an item is unavailable, an obvious pricing error is discovered, or we cannot fulfil your order, we will contact you to resolve it and arrange any refund due for the unfulfilled purchase. We will not charge a higher price or substitute a different item without your agreement. Later price changes do not automatically change an existing confirmed order.',
    ],
  },
  {
    title: 'Shipping and International Orders',
    paragraphs: [
      'Delivery options and charges are shown at checkout and in our Shipping & Returns policy. Delivery estimates are not a guarantee of arrival on a particular date unless we expressly agree otherwise. Contact us promptly about a late, missing or damaged delivery; your statutory delivery rights remain unaffected.',
      'International shipping is not free unless expressly offered for your order. Destination-country import duties, taxes or clearance charges may apply separately; they are not included unless expressly stated. Please contact us before ordering if you need clarification about delivery to your country.',
    ],
  },
  {
    title: 'Cancellations, Returns and Refunds',
    paragraphs: [
      'For a cancellation or return, contact us with your order reference and the relevant item details. Our published voluntary return policy currently offers a seven-day return window for eligible purchases and sets out condition requirements, exclusions and a five-to-seven-business-day processing estimate after receipt and inspection. Read Shipping & Returns before purchasing.',
      'The voluntary-policy exclusions for bespoke or one-of-a-kind pieces do not remove remedies for faulty, damaged, incorrect or misdescribed goods, or any mandatory cancellation right. Return costs may only be charged where disclosed and permitted by applicable law. Statutory refund requirements take priority over voluntary-policy timelines.',
    ],
  },
  {
    title: 'International Consumer Rights',
    paragraphs: [
      'Where EU consumer distance-selling law applies, consumers generally have 14 days after receiving goods to notify us of withdrawal without giving a reason, and a further 14 days to return them. Notify us by email or another clear statement identifying the order. A genuinely personalised or made-to-specification item may be exempt where the law allows; being one-of-a-kind alone is not such an exemption.',
      'Where that right applies, refunds include eligible standard outbound delivery charges and are due within 14 days of your withdrawal notice. We may withhold reimbursement until the goods are returned or evidence of return is supplied, where permitted. Any lawful deduction for diminished value must reflect handling beyond what is necessary to inspect the goods. Other mandatory rights in your country, including remedies for defective goods, are not limited by these terms.',
    ],
  },
  {
    title: 'Offers, Accounts and Website Use',
    paragraphs: [
      'Sale and coupon conditions, eligibility and validity periods are shown with the relevant offer or at checkout. A discount does not reduce your statutory consumer rights. Separate written arrangements may apply to wholesale purchases.',
      'Keep your account credentials secure and tell us about suspected unauthorised use. Do not submit fraudulent orders, misuse another person\'s information, send spam, interfere with the website or attempt unauthorised access. We may restrict abusive activity, but this does not remove obligations relating to an existing purchase.',
      'Website content, branding and images must not be reused without the relevant rights holder\'s permission, except where the law allows. Personal information is handled under our Privacy Policy.',
    ],
  },
  {
    title: 'Responsibility, Disputes and Updates',
    paragraphs: [
      'We are responsible for our obligations under applicable law. Nothing here excludes liability for fraud, misrepresentation or any matter that cannot legally be excluded, or limits your right to seek a lawful remedy through a competent court, consumer forum or other authority.',
      'Indian law applies where applicable, subject to mandatory protections available to you in your country. Contact our customer-care team first if you have a concern, but doing so is not a waiver of any legal right. We may update these terms for future orders; changes do not retrospectively remove rights attached to an existing purchase.',
    ],
  },
];

export default function TermsPage() {
  return (
    <article className="min-h-screen bg-[#0a0a0a] px-5 py-12 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-gold">Surya Jewellers</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Terms of Service</h1>
        <p className="mt-5 text-sm leading-7 text-white/70">Effective for new orders from 27 October 2026.</p>
        <nav aria-label="Related policies" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gold">
          <Link href="/shipping" className="py-2 underline underline-offset-4">Shipping &amp; Returns</Link>
          <Link href="/privacy" className="py-2 underline underline-offset-4">Privacy Policy</Link>
          <Link href="/blog/size-guide" className="py-2 underline underline-offset-4">Ring Size Guide</Link>
        </nav>
        <div className="mt-8 space-y-10 border-t border-white/15 pt-8">
          {sections.map(section => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
          <section>
            <h2 className="font-serif text-2xl">Business and Customer Care</h2>
            <address className="mt-4 space-y-2 text-sm not-italic leading-7 text-white/75">
              <p>Registered business name: Surya Jewellers</p>
              <p>B-169 Anandpuri, Moti Doongri Road<br />Jaipur, Rajasthan 302004, India</p>
              <p><a className="break-words text-gold underline underline-offset-4" href="mailto:suryajewellersjaipur@gmail.com">suryajewellersjaipur@gmail.com</a></p>
              <p><a className="text-gold underline underline-offset-4" href="tel:+919983939306">+91 99839 39306</a></p>
            </address>
            <h3 className="mt-6 font-serif text-xl">Grievance Officer: Pooja Chandra</h3>
            <p className="mt-3 text-sm leading-7 text-white/75">
              Consumer complaints may be addressed to Pooja Chandra at the business address,
              email or telephone listed above. Consumer grievances are to be acknowledged
              within 48 hours and redressed within one month of receipt under applicable
              Indian e-commerce rules.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/75">For an order query or complaint, include your order reference, the issue and the outcome you are requesting. Do not email payment-card numbers or account passwords.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
