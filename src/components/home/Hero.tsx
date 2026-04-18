'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[82vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/hero-bg.jpg.jpeg"
        alt="Surya Jewellers hero background"
        fill
        className="object-cover object-center"
        priority
        fetchPriority="high"
        sizes="100vw"
      />

      {/* Dark overlay — 45% opacity */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Subtle gold vignette at bottom for blending into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

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

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-8 bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
