import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
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
  title: "Surya Jewellers | Premium 92.5 Sterling Silver Jewelry",
  description:
    "Discover exquisite 92.5 sterling silver jewelry adorned with real diamonds and precious stones. Handcrafted elegance from Surya Jewellers — BIS Hallmarked, certified, and timeless.",
  keywords: [
    "silver jewelry",
    "92.5 sterling silver",
    "diamond jewelry",
    "ruby rings",
    "emerald necklaces",
    "sapphire earrings",
    "hallmarked silver",
    "surya jewellers",
  ],
  openGraph: {
    title: "Surya Jewellers | Premium 92.5 Sterling Silver Jewelry",
    description:
      "Handcrafted 92.5 sterling silver jewelry with real diamonds and precious stones.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
