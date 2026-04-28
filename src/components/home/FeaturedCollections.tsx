'use client';

import AnimatedSection from '@/components/ui/AnimatedSection';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';

const collections = [
  { name: 'Rings',     href: '/silver-rings-jaipur',       description: 'Elegant bands & statement pieces',    image: '/categories/rings.webp' },
  { name: 'Necklaces', href: '/silver-necklaces-jaipur',   description: 'Graceful chains & pendants',           image: '/categories/necklaces.webp' },
  { name: 'Earrings',  href: '/products?category=Earrings', description: 'Drops, hoops & statement pieces',     image: '/categories/earrings.webp' },
  { name: 'Bracelets', href: '/silver-bracelets-jaipur',   description: 'Delicate cuffs & bangles',             image: '/categories/bracelets.webp' },
  { name: 'Pendants',  href: '/silver-pendants-jaipur',    description: 'Delicate drops & statement charms',    image: '/categories/pendants.webp' },
  { name: 'Studs',     href: '/products?category=Studs',   description: 'Classic & gemstone ear tops',          image: '/categories/studs.webp' },
];

export default function FeaturedCollections() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">Our Collections</span>
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
            <AnimatedSection key={collection.name} delay={index * 0.08}>
              <Link href={collection.href}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="group cursor-pointer"
                >
                  {/* Image tile */}
                  <div className="aspect-[4/5] relative overflow-hidden rounded-sm">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      style={{ objectFit: 'cover', transition: 'transform 0.7s ease' }}
                      className="group-hover:scale-105"
                      priority={index < 2}
                      loading={index >= 2 ? 'lazy' : undefined}
                    />

                    {/* Overlay */}
                    <div
                      className="absolute inset-0 transition-all duration-500"
                      style={{ background: 'rgba(0,0,0,0.25)', zIndex: 1 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.10)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                    />

                    {/* Name centred over photo */}
                    <div className="absolute inset-0 flex items-end justify-center pb-5" style={{ zIndex: 2 }}>
                      <p
                        className="font-serif text-white text-xl sm:text-2xl tracking-[0.06em]"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                      >
                        {collection.name}
                      </p>
                    </div>
                  </div>

                  {/* Description below card */}
                  <div className="pt-2.5 text-center">
                    <p className="text-xs text-charcoal-muted tracking-wide">{collection.description}</p>
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
