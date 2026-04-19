'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import { motion } from 'motion/react';

const collections = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Elegant bands & statement pieces',
    image: '/categories/rings.jpg',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" stroke="#c9a84c" strokeWidth="1.5">
        <circle cx="40" cy="40" r="22" />
        <circle cx="40" cy="40" r="28" strokeOpacity="0.3" />
        <path d="M28 35 Q40 26 52 35" strokeLinecap="round" />
        <circle cx="40" cy="32" r="3" fill="#c9a84c" fillOpacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Graceful chains & pendants',
    image: '/categories/necklaces.webp',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" stroke="#c9a84c" strokeWidth="1.5">
        <path d="M20 18 Q40 52 60 18" strokeLinecap="round" />
        <circle cx="40" cy="54" r="7" />
        <circle cx="40" cy="54" r="3.5" fill="#c9a84c" fillOpacity="0.5" />
        <circle cx="20" cy="18" r="2" fill="#c9a84c" />
        <circle cx="60" cy="18" r="2" fill="#c9a84c" />
      </svg>
    ),
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Drops, hoops & statement pieces',
    image: '/categories/earrings.jpg',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" stroke="#c9a84c" strokeWidth="1.5">
        <circle cx="28" cy="22" r="4" />
        <path d="M28 26 Q22 44 26 58" strokeLinecap="round" />
        <ellipse cx="26.5" cy="61" rx="4.5" ry="6" />
        <circle cx="52" cy="22" r="4" />
        <path d="M52 26 Q58 44 54 58" strokeLinecap="round" />
        <ellipse cx="53.5" cy="61" rx="4.5" ry="6" />
      </svg>
    ),
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Delicate cuffs & bangles',
    image: '/categories/bracelets.webp',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" stroke="#c9a84c" strokeWidth="1.5">
        <path d="M18 50 Q18 28 40 24 Q62 28 62 50" strokeLinecap="round" />
        <path d="M18 50 Q22 66 40 68 Q58 66 62 50" strokeLinecap="round" />
        <circle cx="40" cy="24" r="3" fill="#c9a84c" fillOpacity="0.6" />
        <circle cx="26" cy="27" r="2" fill="#c9a84c" fillOpacity="0.4" />
        <circle cx="54" cy="27" r="2" fill="#c9a84c" fillOpacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    description: 'Delicate drops & statement charms',
    image: '/categories/pendants.webp',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" stroke="#c9a84c" strokeWidth="1.5">
        <path d="M30 18 Q40 16 50 18" strokeLinecap="round" />
        <path d="M40 18 L40 30" />
        <path d="M40 30 L52 50 L40 64 L28 50 Z" />
        <circle cx="40" cy="47" r="4" fill="#c9a84c" fillOpacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'Studs',
    slug: 'studs',
    description: 'Classic & gemstone ear tops',
    image: '/categories/studs.jpg',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" stroke="#c9a84c" strokeWidth="1.5">
        <circle cx="27" cy="36" r="10" />
        <circle cx="27" cy="36" r="5" fill="#c9a84c" fillOpacity="0.4" />
        <path d="M27 46 L27 58" strokeLinecap="round" />
        <circle cx="53" cy="36" r="10" />
        <circle cx="53" cy="36" r="5" fill="#c9a84c" fillOpacity="0.4" />
        <path d="M53 46 L53 58" strokeLinecap="round" />
      </svg>
    ),
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.map((collection, index) => (
            <AnimatedSection key={collection.slug} delay={index * 0.08}>
              <Link href={`/products?category=${collection.slug}`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group cursor-pointer"
                >
                  {/* Image tile */}
                  <div className="aspect-[4/5] relative overflow-hidden rounded-sm">
                    {/* Background image — plain img for guaranteed rendering */}
                    <img
                      src={collection.image}
                      alt={collection.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                      className="group-hover:scale-105"
                    />

                    {/* Dark overlay — lightens on hover */}
                    <div
                      className="absolute inset-0 transition-all duration-500"
                      style={{ background: 'rgba(0,0,0,0.25)', zIndex: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.10)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                    />

                    {/* Centre icon + name */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ zIndex: 2 }}>
                      <div className="w-28 h-28 rounded-full border border-[#c9a84c]/50 flex items-center justify-center group-hover:border-[#c9a84c]/80 transition-all duration-500 group-hover:scale-110">
                        {collection.icon}
                      </div>
                      <div className="text-center px-4">
                        <p
                          className="font-serif text-white text-xl sm:text-2xl tracking-[0.08em]"
                          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                        >
                          {collection.name}
                        </p>
                        <div className="w-8 h-[1px] bg-[#c9a84c]/70 mx-auto mt-2 group-hover:w-14 transition-all duration-500" />
                      </div>
                    </div>
                  </div>

                  {/* Caption below */}
                  <div className="pt-3 text-center">
                    <p className="text-xs text-charcoal-muted tracking-wide">{collection.description}</p>
                    <span className="inline-block mt-1.5 text-gold text-[10px] tracking-[0.25em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300">
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
