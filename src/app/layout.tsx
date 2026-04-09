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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
        <body className="min-h-screen flex flex-col antialiased">
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
