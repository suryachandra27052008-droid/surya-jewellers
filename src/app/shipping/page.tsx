'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

const shipping = [
  { icon: '✦', title: 'Free Shipping Across India', desc: 'All orders ship free within India — no minimum order value.' },
  { icon: '✦', title: 'Standard Delivery', desc: '5–7 business days from the date your order is confirmed.' },
  { icon: '✦', title: 'Express Delivery', desc: '2–3 business days. Available at checkout for select pin codes.' },
  { icon: '✦', title: 'International Shipping', desc: 'We ship to all countries worldwide. Duties and taxes may apply.' },
  { icon: '✦', title: 'Insured & Tracked', desc: 'Every order is fully insured and comes with end-to-end tracking.' },
  { icon: '✦', title: 'Premium Gift Packaging', desc: 'Each piece is packed in our signature gift box — ready to gift.' },
];

const returns = [
  { icon: '✦', title: '7-Day Return Window', desc: 'Returns accepted within 7 days of delivery, no questions asked.' },
  { icon: '✦', title: 'Condition Requirement', desc: 'Item must be unused, unworn, and in its original packaging with all tags intact.' },
  { icon: '✦', title: 'Custom & One-Piece Designs', desc: 'Bespoke and one-of-a-kind pieces are non-returnable and non-exchangeable.' },
  { icon: '✦', title: 'Refund Timeline', desc: 'Refunds are processed within 5–7 business days after we receive and inspect the item.' },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative pt-40 pb-24 overflow-hidden flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-gold/8" />

        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-gold/60"
            style={{ top: `${20 + i * 18}%`, left: `${15 + i * 20}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <p className="text-gold/70 tracking-[0.4em] uppercase text-xs font-medium mb-6">
            ✦ &nbsp; Surya Jewellers &nbsp; ✦
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-white leading-tight mb-5">
            Shipping &{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent italic">
              Returns
            </span>
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="text-white/45 font-light leading-relaxed">
            We want you to love what you receive. Here is everything you need to know about how we ship and how to return if needed.
          </p>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-20">

        {/* Shipping Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-white">Shipping</h2>
              <div className="w-12 h-[1px] bg-gold/40 mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shipping.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="border border-white/8 bg-white/3 hover:bg-white/5 hover:border-gold/20 transition-all duration-300 p-6 rounded-sm group"
              >
                <span className="text-gold text-xs mb-3 block">{item.icon}</span>
                <h3 className="font-serif text-base text-white mb-2 group-hover:text-gold-light transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Returns Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-white">Returns</h2>
              <div className="w-12 h-[1px] bg-gold/40 mt-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {returns.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="border border-white/8 bg-white/3 hover:bg-white/5 hover:border-gold/20 transition-all duration-300 p-6 rounded-sm group"
              >
                <span className="text-gold text-xs mb-3 block">{item.icon}</span>
                <h3 className="font-serif text-base text-white mb-2 group-hover:text-gold-light transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="border border-gold/20 bg-gold/5 p-8 rounded-sm text-center"
          >
            <p className="text-gold/70 tracking-[0.3em] uppercase text-xs mb-3">✦ Get in Touch</p>
            <h3 className="font-serif text-xl text-white mb-4">Need to Initiate a Return?</h3>
            <p className="text-white/50 text-sm font-light mb-6 max-w-md mx-auto">
              Reach out to us before sending anything back and we will guide you through the process.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="mailto:suryajewellersjaipur@gmail.com"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                suryajewellersjaipur@gmail.com
              </a>
              <span className="text-white/20 hidden sm:block">|</span>
              <a
                href="tel:+919983939306"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors duration-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                099839 39306
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* Bottom nav */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center pt-4"
        >
          <Link href="/products" className="btn-gold inline-block text-xs">
            Browse Collections
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
