import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import Testimonials from '@/components/home/Testimonials';
import TrustSection from '@/components/home/TrustSection';

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
  ],
};

export default function HomePage() {
  return (
    <>
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
    </>
  );
}
