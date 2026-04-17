import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import LayoutShell from "@/components/layout/LayoutShell";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/logo_sj.png", type: "image/png" }],
    apple: "/logo_sj.png",
    shortcut: "/logo_sj.png",
  },
  title: {
    default: "Surya Jewellers | 92.5 Sterling Silver Jewellery, Jaipur",
    template: "%s | Surya Jewellers",
  },
  description:
    "Surya Jewellers, Jaipur's premier 92.5 sterling silver jewellery manufacturer since 2003. Handcrafted rings, necklaces, earrings with natural diamonds and precious gemstones. Certificate of Authenticity.",
  keywords: [
    "Surya Jewellers Jaipur",
    "92.5 sterling silver jewellery",
    "silver jewellery manufacturer Jaipur",
    "natural diamond jewellery",
    "ruby silver rings",
    "emerald necklaces",
    "sapphire earrings",
    "certified silver jewellery",
    "handcrafted jewellery",
  ],
  verification: {
    google: "-6zyoc8a4UjXayuNcv5Ij90FqUG8S8s9oGdd6W7gc3E",
  },
  metadataBase: new URL("https://suryajewellers.shop"),
  alternates: {
    canonical: "https://suryajewellers.shop",
  },
  openGraph: {
    title: "Surya Jewellers | 92.5 Sterling Silver Jewellery, Jaipur",
    description:
      "Surya Jewellers, Jaipur's premier 92.5 sterling silver jewellery manufacturer since 2003. Handcrafted rings, necklaces, earrings with natural diamonds and precious gemstones. Certificate of Authenticity.",
    type: "website",
    url: "https://suryajewellers.shop",
    siteName: "Surya Jewellers",
    images: [{ url: "/logo_sj.png", width: 512, height: 512, alt: "Surya Jewellers" }],
  },
  twitter: {
    card: "summary",
    title: "Surya Jewellers | 92.5 Sterling Silver Jewellery, Jaipur",
    description:
      "Jaipur's premier 92.5 sterling silver jewellery manufacturer since 2003. Natural diamonds & precious gemstones. Certificate of Authenticity.",
    images: ["/logo_sj.png"],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: 'Surya Jewellers',
  url: 'https://suryajewellers.shop',
  logo: 'https://suryajewellers.shop/logo_sj.png',
  image: 'https://suryajewellers.shop/logo_sj.png',
  description:
    'Handcrafted 92.5 sterling silver jewellery with certified natural gemstones. Family-owned since 2003, based in Jaipur.',
  telephone: '+91-99839-39306',
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
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Credit Card, UPI, Debit Card',
  founder: [
    { '@type': 'Person', name: 'Sanjay Chandra' },
    { '@type': 'Person', name: 'Pooja Chandra' },
  ],
  foundingDate: '2003',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Surya Jewellers',
  url: 'https://suryajewellers.shop',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://suryajewellers.shop/products?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Surya Jewellers',
  url: 'https://suryajewellers.shop',
  logo: 'https://suryajewellers.shop/logo_sj.png',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-99839-39306',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
        <body className="min-h-screen flex flex-col antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <LayoutShell>{children}</LayoutShell>
          <Script
            src="https://widget.kalcend.ai/widget.js"
            data-config-id="MCDtb7d7EgVbuc17I72u"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
