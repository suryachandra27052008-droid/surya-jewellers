'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import { motion } from 'motion/react';

const collections = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Elegant bands & statement pieces',
    emoji: '💍',
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Graceful chains & pendants',
    emoji: '📿',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Studs, hoops & danglers',
    emoji: '✨',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Delicate cuffs & bangles',
    emoji: '⭐',
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    description: 'Delicate drops & statement charms',
    emoji: '🔮',
  },
  {
    name: 'Studs / Tops',
    slug: 'studs',
    description: 'Classic & gemstone ear tops',
    emoji: '🌟',
  },
];

export default function FeaturedCollections() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            Our Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-4 mb-4 text-charcoal gold-underline">
            Curated for You
          </h2>
          <p className="text-charcoal-muted text-sm sm:text-base max-w-lg mx-auto mt-6">
            Explore our handpicked categories of sterling silver jewelry,
            each piece crafted with meticulous attention to detail.
          </p>
        </AnimatedSection>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <AnimatedSection key={collection.slug} delay={index * 0.1}>
              <Link href={`/products?category=${collection.slug}`}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group relative bg-cream rounded overflow-hidden cursor-pointer border border-transparent hover:border-gold/20 transition-colors"
                >
                  {/* Image placeholder - elegant gradient */}
                  <div className="aspect-[4/5] bg-gradient-to-br from-cream-dark to-cream flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/5 to-transparent" />
                    <span className="text-6xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-110 transform">
                      {collection.emoji}
                    </span>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-all duration-500" />
                  </div>
                  {/* Info */}
                  <div className="p-6 text-center">
                    <h3 className="font-serif text-xl tracking-[0.1em] text-charcoal mb-1">
                      {collection.name}
                    </h3>
                    <p className="text-xs text-charcoal-muted tracking-wide">
                      {collection.description}
                    </p>
                    <span className="inline-block mt-4 text-gold text-xs tracking-[0.2em] uppercase group-hover:tracking-[0.3em] transition-all duration-300">
                      Explore →
                    </span>
                  </div>
                </motion.div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
