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
                { href: '/shipping', label: 'Shipping & Returns' },
                { href: '/size-guide', label: 'Size Guide' },
                { href: '/contact', label: 'Contact Us' },
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
                BIS Hallmarked 92.5 Silver
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Certified Natural Diamonds
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Certificate of Authenticity
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#D4AF37' }}>✦</span>
                Lifetime Maintenance
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-white/40">
                Contact: suryajewellersjaipur@gmail.com
              </p>
              <p className="text-xs text-white/40 mt-1">
                Phone: 099839 39306
              </p>
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
