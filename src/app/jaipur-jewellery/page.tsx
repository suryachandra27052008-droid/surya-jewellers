import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Jewellers in Jaipur | 92.5 Sterling Silver | Surya Jewellers' },
  description:
    'Family-owned 92.5 silver jewellery manufacturer in Jaipur since 2003. Rings, necklaces & earrings with natural diamonds. Visit showroom or shop online.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/jaipur-jewellery',
  },
  openGraph: {
    title: 'Jewellers in Jaipur — 92.5 Sterling Silver | Surya Jewellers',
    description:
      'Family-owned silver jeweller in Jaipur since 2003. Certified natural gemstones, Certificate of Authenticity, lifetime maintenance, worldwide shipping.',
    type: 'website',
    url: 'https://www.suryajewellers.com/jaipur-jewellery',
    siteName: 'Surya Jewellers',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Jewellers in Jaipur — Surya Jewellers' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jewellers in Jaipur — Surya Jewellers',
    description: 'Handcrafted 92.5 sterling silver jewellery in Jaipur since 2003. Natural diamonds & gemstones.',
    images: ['/opengraph-image'],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  '@id': 'https://www.suryajewellers.com/#business',
  name: 'Surya Jewellers',
  url: 'https://www.suryajewellers.com',
  logo: 'https://www.suryajewellers.com/logo_sj.png',
  image: 'https://www.suryajewellers.com/opengraph-image',
  description:
    'Family-owned 92.5 sterling silver jewellery manufacturer in Jaipur, Rajasthan. Handcrafted rings, necklaces, earrings, bracelets with certified natural gemstones since 2003.',
  telephone: '+91 99839 39306',
  email: 'suryajewellersjaipur@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'B-169 Anandpuri, Moti Doongri Rd, near Naila House',
    addressLocality: 'Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302004',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 26.904809860527966,
    longitude: 75.82120473955301,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '6',
    bestRating: '5',
    worstRating: '1',
  },
  hasMap: 'https://maps.google.com/?q=Surya+Jewellers,+B-169+Anandpuri,+Moti+Doongri+Rd,+Jaipur,+Rajasthan+302004',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, UPI, Debit Card',
  foundingDate: '2003',
  founder: [
    { '@type': 'Person', name: 'Sanjay Chandra' },
    { '@type': 'Person', name: 'Pooja Chandra' },
  ],
  areaServed: {
    '@type': 'City',
    name: 'Jaipur',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suryajewellers.com' },
    { '@type': 'ListItem', position: 2, name: 'Jewellers in Jaipur', item: 'https://www.suryajewellers.com/jaipur-jewellery' },
  ],
};

export default function JaipurJewelleryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="pt-8 pb-20">
        {/* Hero */}
        <section className="bg-charcoal text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-[#1a1208] to-charcoal" />
          <div className="relative max-w-4xl mx-auto">
            <span className="text-xs tracking-[0.4em] uppercase" style={{ color: '#c9a84c' }}>
              ✦ Jaipur, Rajasthan ✦
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl mt-4 mb-6 text-white">
              Jewellers in Jaipur
            </h1>
            <div className="h-[1px] w-24 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
            <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Handcrafted 92.5 sterling silver jewellery set with certified natural gemstones.
              Family-owned since 2003, based near Moti Doongri, Jaipur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/products" className="btn-gold">
                Shop Collections
              </Link>
              <Link
                href="https://maps.google.com/?q=Surya+Jewellers,+B-169+Anandpuri,+Moti+Doongri+Rd,+Jaipur,+Rajasthan+302004"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border border-white/30 text-white/80 text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300"
              >
                Get Directions
              </Link>
            </div>
          </div>
        </section>

        {/* About — keyword-rich content */}
        <section className="py-20 bg-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Heritage</span>
              <h2 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal">
                Jaipur's Tradition of Fine Silversmithing
              </h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
            </div>

            <div className="prose prose-sm sm:prose text-charcoal-muted max-w-none space-y-5">
              <p>
                Jaipur has been the jewellery capital of India for centuries. Known as the <strong>Pink City</strong>,
                it sits at the heart of Rajasthan's thriving gemstone trade — home to cutters, polishers, setters,
                and silversmiths who have refined their craft across generations. <strong>Surya Jewellers</strong> was
                founded here in 2003 by Sanjay Chandra and Pooja Chandra, with a single mission: to create
                extraordinary <strong>92.5 sterling silver jewellery</strong> worthy of Jaipur's legacy.
              </p>
              <p>
                Our workshop is located at <strong>B-169 Anandpuri, Moti Doongri Road</strong>, just minutes from
                the iconic Moti Doongri Fort and the bustling Johari Bazaar — the traditional jewellery market of
                Jaipur. Every piece we make is handcrafted on-site by skilled artisans who have spent years mastering
                traditional silversmithing techniques such as filigree, meenakari, and stone-setting.
              </p>
              <p>
                Our collections span <strong>rings, necklaces, earrings, bracelets, pendants, and studs</strong>,
                each set with certified natural gemstones — natural diamonds, rubies, emeralds, sapphires, opals,
                moonstones, tanzanite, and more. We source only ethically obtained stones and pair them with
                hallmarked 925 silver to ensure quality you can trust.
              </p>
              <p>
                What sets us apart is our commitment to uniqueness: approximately <strong>90% of our designs are
                one-piece, one-design creations</strong>. When you purchase a Surya Jewellers piece, you are
                buying something that may never be made again. Every creation is accompanied by a
                <strong> Certificate of Authenticity</strong> detailing the silver purity, gemstone type,
                and carat weight — our pledge of transparency to every customer.
              </p>
              <p>
                Whether you are a local Jaipur resident looking for a special gift, a tourist exploring the city's
                famous jewellery heritage, or an international buyer seeking <strong>wholesale sterling silver
                jewellery from Jaipur</strong>, Surya Jewellers offers quality, craftsmanship, and integrity under
                one roof.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-gold text-xs tracking-[0.4em] uppercase">Why Surya Jewellers</span>
              <h2 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal">
                Jaipur's Trusted Silver Jewellery Maker
              </h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Over 20 Years of Craft',
                  desc: 'Founded in 2003, we bring more than two decades of silversmithing expertise from the heart of Jaipur.',
                },
                {
                  title: 'Certified Natural Gemstones',
                  desc: 'Every diamond, ruby, emerald, and sapphire we use is ethically sourced and comes with documentation.',
                },
                {
                  title: 'Certificate of Authenticity',
                  desc: 'Each piece ships with a certificate verifying 92.5 silver purity, gemstone type, and carat weight.',
                },
                {
                  title: 'One-of-a-Kind Designs',
                  desc: '90% of our creations are unique single-design pieces — you own something truly rare.',
                },
                {
                  title: 'Lifetime Maintenance',
                  desc: 'Bring any Surya Jewellers piece to our Jaipur showroom for complimentary cleaning and polishing.',
                },
                {
                  title: 'Worldwide Shipping',
                  desc: 'We ship securely to India, USA, UK, Australia, the Middle East, and beyond — fully insured.',
                },
              ].map((item) => (
                <div key={item.title} className="border border-cream-dark rounded p-6 bg-cream/40">
                  <div className="text-gold text-lg mb-3">✦</div>
                  <h3 className="font-serif text-lg text-charcoal mb-2">{item.title}</h3>
                  <p className="text-charcoal-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visit Us / NAP */}
        <section className="py-20 bg-charcoal text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs tracking-[0.4em] uppercase" style={{ color: '#c9a84c' }}>
              Visit Our Showroom
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl mt-4 mb-8 text-white">
              Come See Us in Jaipur
            </h2>
            <div className="h-[1px] w-24 mx-auto mb-10" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

            <div
              className="rounded p-8 border text-left space-y-4"
              style={{ borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.05)' }}
              itemScope
              itemType="https://schema.org/JewelryStore"
            >
              <p className="font-serif text-xl text-white mb-4" itemProp="name">Surya Jewellers</p>
              <p className="text-white/70 text-sm" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span itemProp="streetAddress">B-169 Anandpuri, Moti Doongri Rd, near Naila House</span><br />
                <span itemProp="addressLocality">Jaipur</span>, <span itemProp="addressRegion">Rajasthan</span>{' '}
                <span itemProp="postalCode">302004</span>, India
              </p>
              <p className="text-white/70 text-sm">
                Phone:{' '}
                <a href="tel:+919983939306" className="hover:text-gold transition-colors" itemProp="telephone">
                  +91 99839 39306
                </a>
              </p>
              <p className="text-white/70 text-sm">
                Email:{' '}
                <a href="mailto:suryajewellersjaipur@gmail.com" className="hover:text-gold transition-colors" itemProp="email">
                  suryajewellersjaipur@gmail.com
                </a>
              </p>
              <p className="text-white/70 text-sm" itemProp="openingHours" content="Mo-Sa 10:00-20:00">
                Hours: Monday – Saturday, 10:00 AM – 8:00 PM IST
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-gold">
                Browse Collections
              </Link>
              <Link href="/contact" className="px-8 py-3 border border-white/30 text-white/80 text-sm tracking-widest uppercase hover:border-gold hover:text-gold transition-all duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
