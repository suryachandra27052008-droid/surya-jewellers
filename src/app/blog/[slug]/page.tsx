'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getPost } from '../data';

const categoryColors: Record<string, string> = {
  'Care & Maintenance': 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  'Education': 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  'Our Story': 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  'Style Guide': 'text-rose-400 border-rose-400/30 bg-rose-400/10',
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0];
  const post = slug ? getPost(slug) : undefined;

  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gold/5 blur-[100px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/35 hover:text-gold text-xs tracking-[0.2em] uppercase mb-10 transition-colors duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            The Journal
          </Link>

          {/* Category + read time */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className={`text-[0.7rem] tracking-[0.2em] uppercase font-medium px-2.5 py-1 rounded-full border ${
                categoryColors[post.category] ?? 'text-gold border-gold/30 bg-gold/10'
              }`}
            >
              {post.category}
            </span>
            <span className="text-white/30 text-xs">{post.readTime}</span>
            <span className="text-white/20 text-xs">{post.date}</span>
          </div>

          {/* Author byline */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-xs text-gold font-semibold">
              {post.author.charAt(0)}
            </span>
            <div className="text-left">
              <span className="text-white/70 text-xs font-medium">{post.author}</span>
              <span className="text-white/30 text-xs"> · {post.authorRole}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-5">
            {post.title}
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-5" />
          <p className="text-white/45 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {post.subtitle}
          </p>
        </motion.div>
      </section>

      {/* Article Body */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="border-t border-white/8 pt-12 space-y-6"
        >
          {post.content.map((section, i) => {
            if (section.type === 'paragraph') {
              return (
                <p key={i} className="text-white/65 font-light leading-relaxed text-base md:text-[1.05rem]">
                  {section.text}
                </p>
              );
            }
            if (section.type === 'heading') {
              return (
                <h2 key={i} className="font-serif text-2xl md:text-3xl text-white mt-12 mb-2">
                  {section.text}
                </h2>
              );
            }
            if (section.type === 'subheading') {
              return (
                <h3 key={i} className="font-serif text-lg text-gold-light mt-6 mb-1">
                  {section.text}
                </h3>
              );
            }
            if (section.type === 'quote') {
              return (
                <blockquote
                  key={i}
                  className="border-l-2 border-gold/50 pl-6 my-8 italic text-white/60 text-base md:text-lg font-light leading-relaxed"
                >
                  {section.text}
                </blockquote>
              );
            }
            if (section.type === 'list' && section.items) {
              return (
                <ul key={i} className="space-y-3 my-4">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex gap-3 text-white/60 font-light text-sm md:text-base leading-relaxed">
                      <span className="text-gold mt-1 flex-shrink-0 text-xs">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (section.type === 'table' && section.headers && section.rows) {
              return (
                <div key={i} className="overflow-hidden border border-white/8 rounded-sm my-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gold/10 border-b border-white/8">
                        {section.headers.map((h, j) => (
                          <th key={j} className="py-3 px-5 text-left text-gold tracking-[0.15em] uppercase text-xs font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, j) => (
                        <tr key={j} className={`border-b border-white/5 hover:bg-white/4 transition-colors duration-200 ${j % 2 === 0 ? 'bg-white/[0.015]' : 'bg-transparent'}`}>
                          {row.map((cell, k) => (
                            <td key={k} className={`py-3 px-5 ${k === 0 ? 'text-white font-medium' : 'text-white/60'}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            return null;
          })}
        </motion.div>

        {/* Bottom navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 pt-10 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <Link
            href="/blog"
            className="flex items-center gap-2 text-white/35 hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Articles
          </Link>
          <Link href="/products" className="btn-gold text-xs">
            Explore Collections
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
