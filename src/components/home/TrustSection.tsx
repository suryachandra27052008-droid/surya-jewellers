const pillars = [
  {
    title: 'Certificate of Authenticity',
    subtitle: '92.5 Sterling Silver',
    description:
      'Every piece comes with a certificate guaranteeing 92.5% pure silver composition. No compromises on purity.',
  },
  {
    title: 'Real Diamonds',
    subtitle: '& Precious Stones',
    description:
      'We use only natural, certified diamonds, rubies, emeralds, and sapphires. Each stone is hand-selected for brilliance.',
  },
  {
    title: 'Skilled Artisans',
    subtitle: 'Master Craftsmen',
    description:
      "Every piece is handcrafted by master artisans with decades of experience in Jaipur's finest jewellery tradition.",
  },
  {
    title: 'Lifetime',
    subtitle: 'Maintenance Promise',
    description:
      'We stand behind our craftsmanship. Enjoy complimentary cleaning, polishing, and repair services for life.',
  },
];

export default function TrustSection() {
  return (
    <section className="py-24 px-4 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            Our Promise
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-4 text-charcoal gold-underline">
            Why Choose Our 92.5 Silver
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="text-center p-8 bg-white rounded border border-cream-dark hover:border-gold/30 transition-colors duration-300 group h-full"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cream mb-6 text-gold group-hover:bg-gold/10 transition-colors duration-300">
                <span className="text-2xl">+</span>
              </div>
              <h3 className="font-serif text-lg text-charcoal mb-0.5">
                {pillar.title}
              </h3>
              <p
                className="text-xs tracking-[0.15em] uppercase mb-4"
                style={{ color: '#D4AF37' }}
              >
                {pillar.subtitle}
              </p>
              <p className="text-sm text-charcoal-muted leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
