import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/80">
      {/* Gold accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl tracking-[0.2em] text-white mb-2">
              SURYA
            </h3>
            <p
              className="text-[0.7rem] tracking-[0.35em] uppercase mb-6"
              style={{ color: '#D4AF37' }}
            >
              Jewellers
            </p>
            <p className="text-sm leading-relaxed text-white/60">
              Crafting timeless elegance in 92.5 sterling silver.
              Every piece tells a story of artistry, precision, and the finest
              precious stones.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/products', label: 'Collections' },
                { href: '/products?category=rings', label: 'Rings' },
                { href: '/products?category=necklaces', label: 'Necklaces' },
                { href: '/products?category=earrings', label: 'Earrings' },
                { href: '/products?category=bracelets', label: 'Bracelets' },
                { href: '/products?category=pendants', label: 'Pendants' },
                { href: '/products?category=studs', label: 'Studs / Tops' },
                { href: '/shipping', label: 'Shipping & Returns' },
                { href: '/blog/size-guide', label: 'Size Guide' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/wholesale', label: 'Wholesale / B2B' },
                { href: '/jaipur-jewellery', label: 'Jewellers in Jaipur' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Contact */}
          <div>
            <h4
              className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Trust & Assurance
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Certificate of Authenticity
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Certified Natural Diamonds
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Skilled Artisans
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Lifetime Maintenance
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10" itemScope itemType="https://schema.org/JewelryStore">
              <p className="text-xs text-white/60 font-medium mb-2" style={{ color: '#D4AF37' }}>
                Visit Us
              </p>
              <address className="not-italic text-xs text-white/50 leading-relaxed space-y-1">
                <span itemProp="name" className="sr-only">Surya Jewellers</span>
                <p itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <span itemProp="streetAddress">B-169 Anandpuri, Moti Doongri Rd</span>,{' '}
                  <span itemProp="addressLocality">Jaipur</span>,{' '}
                  <span itemProp="addressRegion">Rajasthan</span>{' '}
                  <span itemProp="postalCode">302004</span>
                </p>
                <p>
                  <a href="tel:+919983939306" itemProp="telephone" className="hover:text-gold transition-colors">
                    +91 99839 39306
                  </a>
                </p>
                <p>
                  <a href="mailto:suryajewellersjaipur@gmail.com" itemProp="email" className="hover:text-gold transition-colors">
                    suryajewellersjaipur@gmail.com
                  </a>
                </p>
                <p itemProp="openingHours" content="Mo-Sa 10:00-20:00">
                  Mon–Sat: 10 AM – 8 PM IST
                </p>
              </address>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Surya Jewellers. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Crafted with ♦ for those who appreciate the extraordinary
          </p>
        </div>
      </div>
    </footer>
  );
}
