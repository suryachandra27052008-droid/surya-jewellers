import Link from 'next/link';
import HeroSlideshow from '@/components/HeroSlideshow';

export default function Hero() {
  return (
    <HeroSlideshow>
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-4xl mx-auto py-20">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <span
              className="text-sm sm:text-base font-semibold tracking-[4px] uppercase"
              style={{ color: '#c9a84c', fontVariant: 'small-caps' }}
            >
              Jewellery by Surya Jewellers
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">
            Crafted in Pure
            <br />
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              92.5 Sterling Silver
            </span>
          </h1>

          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Exquisite jewelry adorned with natural diamonds and precious stones.
            <br className="hidden sm:block" />
            Each piece, a testament to timeless artistry and uncompromising quality.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="btn-gold text-sm">
              Shop Jewellery
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-white/40 text-xs tracking-[0.15em] uppercase">
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">+</span> Certificate of Authenticity
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">+</span> Natural Diamonds
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">+</span> Certified
            </span>
          </div>
        </div>
      </div>
    </HeroSlideshow>
  );
}
