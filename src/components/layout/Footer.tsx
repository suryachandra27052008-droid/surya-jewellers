import Link from 'next/link';

const LINKS_COL1 = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/products', label: 'Collections' },
  { href: '/925-silver-rings', label: '925 Silver Rings' },
  { href: '/silver-rings-jaipur', label: 'Silver Rings Jaipur' },
  { href: '/silver-necklaces-jaipur', label: 'Silver Necklaces' },
];

const LINKS_COL2 = [
  { href: '/silver-bracelets-jaipur', label: 'Silver Bracelets' },
  { href: '/silver-pendants-jaipur', label: 'Silver Pendants' },
  { href: '/ruby-silver-earrings', label: 'Ruby Silver Earrings' },
  { href: '/wholesale-silver-jewellery-jaipur', label: 'Wholesale Silver Jewellery' },
  { href: '/shipping', label: 'Shipping & Returns' },
  { href: '/blog/size-guide', label: 'Size Guide' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/wholesale', label: 'Wholesale / B2B' },
  { href: '/jaipur-jewellery', label: 'Jewellers in Jaipur' },
];

const MOBILE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Collections' },
  { href: '/silver-rings-jaipur', label: 'Rings' },
  { href: '/silver-necklaces-jaipur', label: 'Necklaces' },
  { href: '/silver-bracelets-jaipur', label: 'Bracelets' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/80">
      {/* Gold accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Col 1 — Brand (25%) */}
          <div className="lg:col-span-1">
            <h3 className="font-serif text-xl sm:text-2xl tracking-[0.2em] text-white mb-1 sm:mb-2">
              SURYA
            </h3>
            <p
              className="text-[0.65rem] sm:text-[0.7rem] tracking-[0.35em] uppercase mb-4 sm:mb-6"
              style={{ color: '#D4AF37' }}
            >
              Jewellers
            </p>
            <p className="hidden sm:block text-sm leading-relaxed text-white/60 mb-6">
              Crafting timeless elegance in 92.5 sterling silver.
              Every piece tells a story of artistry, precision, and the finest
              precious stones.
            </p>
            <p className="sm:hidden text-sm leading-relaxed text-white/60 mb-4">
              Handcrafted 92.5 sterling silver jewellery from Jaipur.
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/suryajewellersjpr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/40 hover:text-gold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 1.924 2.104.493 3.535-.023 5.377.072 7.232.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.095 1.855.611 3.697 2.042 5.128 1.431 1.431 3.273 1.947 5.128 2.042C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.095 3.697-.611 5.128-2.042 1.431-1.431 1.947-3.273 2.042-5.128C23.986 15.668 24 15.259 24 12s-.014-3.668-.072-4.948c-.095-1.855-.611-3.697-2.042-5.128C20.455.673 18.613.157 16.758.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/919983939306"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-white/40 hover:text-gold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Mobile quick links — 2-column grid, only shown below sm */}
          <div className="sm:hidden">
            <h4
              className="text-xs tracking-[0.2em] uppercase mb-3 font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {MOBILE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick Links part 1 (20%) — hidden on mobile */}
          <div className="hidden sm:block lg:col-span-1">
            <h4
              className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {LINKS_COL1.map((link) => (
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

          {/* Col 3 — Quick Links part 2 (20%) — hidden on mobile */}
          <div className="hidden sm:block lg:col-span-1">
            <h4
              className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold invisible"
              aria-hidden="true"
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {LINKS_COL2.map((link) => (
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

          {/* Col 4 — Trust & Assurance + Visit Us (35%) — hidden on mobile */}
          <div className="hidden sm:block lg:col-span-1">
            <h4
              className="text-sm tracking-[0.2em] uppercase mb-6 font-semibold"
              style={{ color: '#D4AF37' }}
            >
              Trust & Assurance
            </h4>
            <ul className="space-y-3 text-sm text-white/60 mb-8">
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

            <div className="pt-6 border-t border-white/10" itemScope itemType="https://schema.org/JewelryStore">
              <p className="text-xs font-medium mb-2" style={{ color: '#D4AF37' }}>
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
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Surya Jewellers. All rights reserved.
          </p>
          <p className="hidden sm:block text-xs text-white/30">
            Crafted with ♦ for those who appreciate the extraordinary
          </p>
        </div>
      </div>
    </footer>
  );
}
