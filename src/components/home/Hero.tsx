'use client';
import { motion } from 'motion/react';
import Link from 'next/link';
import HeroSlideshow from '@/components/HeroSlideshow';

export default function Hero() {
  return (
    <HeroSlideshow>
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center px-4 max-w-4xl mx-auto py-20">

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <span
              className="text-sm sm:text-base font-semibold tracking-[4px] uppercase"
              style={{ color: '#c9a84c', fontVariant: 'small-caps' }}
            >
              ✦ Jewellery by Surya Jewellers ✦
            </span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6"
          >
            Crafted in Pure
            <br />
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
              92.5 Sterling Silver
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Exquisite jewelry adorned with natural diamonds and precious stones.
            <br className="hidden sm:block" />
            Each piece — a testament to timeless artistry and uncompromising quality.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/products" className="btn-gold text-sm">
              Explore Collections
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-10 flex flex-wrap justify-center gap-8 text-white/40 text-xs tracking-[0.15em] uppercase"
          >
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">✦</span> Certificate of Authenticity
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">✦</span> Natural Diamonds
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold text-sm">✦</span> Certified
            </span>
          </motion.div>
        </div>
      </div>
    </HeroSlideshow>
  );
}
