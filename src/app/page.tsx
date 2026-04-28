import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import Testimonials from '@/components/home/Testimonials';
import TrustSection from '@/components/home/TrustSection';
import IntroAnimation from '@/components/IntroAnimation';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.suryajewellers.com/',
  },
};

const aggregateRatingSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.suryajewellers.com/#business',
  name: 'Surya Jewellers',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '6',
    bestRating: '5',
    worstRating: '1',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is 92.5 Sterling Silver?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '92.5 Sterling Silver, also known as 925 silver, is an alloy composed of 92.5% pure silver and 7.5% other metals (usually copper). This composition gives it the strength needed for jewellery-making while retaining the brilliant lustre of pure silver. All Surya Jewellers pieces are hallmarked 92.5 sterling silver.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do your pieces come with a Certificate of Authenticity?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every piece from Surya Jewellers is accompanied by a Certificate of Authenticity that verifies the 92.5 sterling silver purity, the type and carat weight of natural gemstones used, and the craftsmanship standards of our Jaipur workshop.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you ship internationally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Surya Jewellers ships internationally. We have served customers across India, the United States, the United Kingdom, Australia, the Middle East, and Southeast Asia. International orders are carefully packaged and fully insured during transit.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your return policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer a 7-day return and exchange policy on all unworn pieces in their original condition. Custom or personalised orders are non-returnable. Please contact us at suryajewellersjaipur@gmail.com or call +91 99839 39306 to initiate a return.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I visit your store in Jaipur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Our showroom is located at B-169 Anandpuri, Moti Doongri Rd, near Naila House, Jaipur, Rajasthan 302004. We are open Monday to Saturday, 10:00 AM to 8:00 PM. We welcome walk-in customers as well as appointment-based visits for wholesale or custom orders.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer wholesale pricing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Surya Jewellers has been supplying wholesale 92.5 sterling silver jewellery to retailers, boutiques, and exporters since 2003. Wholesale enquiries can be made via our Wholesale page or by emailing suryajewellersjaipur@gmail.com with your requirements and business details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where exactly is your Jaipur showroom located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our showroom is at B-169 Anandpuri, Moti Doongri Road, near Naila House, Jaipur, Rajasthan 302004. We are conveniently located in the Anandpuri area, close to the iconic Moti Doongri Fort. You can reach us by calling +91 99839 39306 or emailing suryajewellersjaipur@gmail.com to schedule a visit.',
      },
    },
    {
      '@type': 'Question',
      name: 'What gemstones are used in Surya Jewellers pieces?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We use a wide range of certified natural gemstones in our 92.5 sterling silver jewellery. Our collection features natural diamonds, rubies, emeralds, sapphires, opals, moonstones, tanzanite, amethysts, garnets, and other precious and semi-precious stones. Every gemstone is ethically sourced and its type and carat weight are documented in the Certificate of Authenticity.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer custom or personalised jewellery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We accept custom and bespoke jewellery commissions. Approximately 90% of our designs are already one-piece, one-design creations, but we are happy to craft personalised pieces to your specifications. Custom orders can be initiated by contacting us at suryajewellersjaipur@gmail.com or calling +91 99839 39306. We will discuss design, gemstone selection, and timelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'How should I care for my sterling silver jewellery?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To maintain the lustre of your 92.5 sterling silver jewellery, store each piece individually in a soft pouch or airtight box to prevent oxidation. Clean with a soft silver-polishing cloth and avoid exposure to perfumes, chlorine, and harsh chemicals. Remove jewellery before swimming or bathing. Surya Jewellers also provides complimentary lifetime maintenance — simply bring your piece to our Jaipur showroom.',
      },
    },
    {
      '@type': 'Question',
      name: 'What payment methods do you accept?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all major payment methods including credit cards, debit cards, UPI, and net banking. At our Jaipur showroom we also accept cash. For online orders, payments are processed securely. Wholesale buyers may be eligible for invoice-based payment terms; please contact us for details.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does delivery take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Domestic orders within India are typically delivered within 5–7 business days. International orders take 10–14 business days depending on the destination country. All orders are fully insured and tracked. You will receive a tracking number as soon as your order ships. Expedited shipping options may be available on request.',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <IntroAnimation />
      <Hero />
      <FeaturedCollections />
      <Testimonials />
      <TrustSection />

      {/* About Surya Jewellers — keyword-rich server-rendered text block */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Story</span>
          <h2 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal mb-6">
            About Surya Jewellers
          </h2>
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8" />
          <div className="text-charcoal-muted text-sm sm:text-base leading-relaxed space-y-4 text-left sm:text-center">
            <p>
              Founded in 2003 by Sanjay Chandra and Pooja Chandra, Surya Jewellers is a family-owned
              jewellery manufacturer based in Jaipur, Rajasthan — the gemstone capital of the world.
              For over two decades we have specialised in handcrafted <strong>92.5 sterling silver jewellery</strong>{' '}
              set with certified natural gemstones including diamonds, rubies, emeralds, sapphires,
              opals, moonstones, tanzanite, and more.
            </p>
            <p>
              Every piece that leaves our Jaipur workshop is crafted by skilled artisans who carry
              forward generations of traditional silversmithing technique. We source only natural,
              ethically obtained gemstones and pair them with hallmarked 925 silver to create rings,
              necklaces, earrings, bracelets, pendants, and studs that stand the test of time.
            </p>
            <p>
              Each creation from Surya Jewellers is accompanied by a <strong>Certificate of Authenticity</strong>{' '}
              that details the silver purity, gemstone type, and carat weight — giving you complete
              confidence in what you wear. Our transparent approach to craftsmanship and materials has
              earned us a loyal customer base spanning India, the United States, the United Kingdom,
              Australia, and the Middle East.
            </p>
            <p>
              Whether you are looking for a diamond solitaire ring, a ruby pendant in sterling silver,
              a natural emerald necklace, or a sapphire bracelet, our collections offer something for
              every occasion. We also cater to wholesale buyers and international exporters, providing
              bulk 92.5 sterling silver jewellery at competitive manufacturer prices from Jaipur.
            </p>
            <p>
              Visit our showroom at B-169 Anandpuri, Moti Doongri Rd, Jaipur, Monday to Saturday
              between 10 AM and 8 PM, or shop online with worldwide shipping and easy returns.
              Surya Jewellers — fine silver jewellery, crafted with heart, certified with integrity.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section with JSON-LD FAQPage schema */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold text-xs tracking-[0.4em] uppercase">Help & Information</span>
            <h2 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal">
              Frequently Asked Questions
            </h2>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
          </div>

          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq, i) => (
              <div key={i} className="border border-cream-dark rounded p-6 bg-cream/40">
                <h3 className="font-serif text-lg text-charcoal mb-3">{faq.name}</h3>
                <p className="text-charcoal-muted text-sm leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />
    </>
  );
}
