'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { posts } from './data';

const categoryColors: Record<string, string> = {
  'Care & Maintenance': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  'Education': 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  'Our Story': 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  'Style Guide': 'text-rose-400 border-rose-400/30 bg-rose-400/10',
};

const romanNumerals = ['I', 'II', 'III', 'IV'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative pt-40 pb-28 overflow-hidden flex flex-col items-center text-center px-4">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-gold/4" />

        {/* Sparkles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-gold/70"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 18}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <p className="text-gold/70 tracking-[0.4em] uppercase text-xs font-medium mb-6">
            ✦ &nbsp; Surya Jewellers &nbsp; ✦
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-6">
            The&nbsp;
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent italic">
              Journal
            </span>
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="text-white/50 text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto">
            Stories, knowledge, and craft from our studio in Jaipur — for those who love fine jewellery as much as we do.
          </p>
        </motion.div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {posts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <div className="relative h-full border border-white/8 bg-white/3 hover:bg-white/6 hover:border-gold/20 transition-all duration-500 rounded-sm overflow-hidden">
                  {/* Top gold accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                  {/* Roman numeral decoration */}
                  <div className="absolute top-6 right-8 font-serif text-6xl text-white/4 group-hover:text-gold/10 transition-colors duration-500 select-none leading-none">
                    {romanNumerals[i]}
                  </div>

                  <div className="p-8 lg:p-10 flex flex-col h-full">
                    {/* Category + read time */}
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className={`text-[0.7rem] tracking-[0.2em] uppercase font-medium px-2.5 py-1 rounded-full border ${
                          categoryColors[post.category] ?? 'text-gold border-gold/30 bg-gold/10'
                        }`}
                      >
                        {post.category}
                      </span>
                      <span className="text-white/25 text-xs">{post.readTime}</span>
                    </div>

                    {/* Title */}
                    <h2 className="font-serif text-xl md:text-2xl text-white group-hover:text-gold-light transition-colors duration-300 leading-snug mb-3">
                      {post.title}
                    </h2>

                    {/* Divider */}
                    <div className="w-8 h-[1px] bg-gold/30 mb-4" />

                    {/* Excerpt */}
                    <p className="text-white/45 text-sm leading-relaxed font-light flex-1 mb-6">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/8">
                      <span className="text-white/30 text-xs tracking-wider">{post.date}</span>
                      <span className="flex items-center gap-2 text-gold/70 group-hover:text-gold text-xs tracking-[0.15em] uppercase font-medium transition-colors duration-300">
                        Read
                        <svg
                          className="w-3.5 h-3.5 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-24 pt-16 border-t border-white/8"
        >
          <p className="text-gold/60 tracking-[0.3em] uppercase text-xs mb-4">✦ Explore</p>
          <h3 className="font-serif text-3xl md:text-4xl text-white mb-4">
            Discover Our Collections
          </h3>
          <p className="text-white/40 font-light mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Every piece you have read about — crafted in 92.5 sterling silver, set with natural gemstones, made in Jaipur.
          </p>
          <Link href="/products" className="btn-gold inline-block text-xs">
            View Collections
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
