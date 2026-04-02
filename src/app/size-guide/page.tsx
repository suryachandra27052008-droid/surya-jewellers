'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

const ringSizes = [
  { indian: 6,  us: '3',    diameter: 14.1 },
  { indian: 7,  us: '3½',   diameter: 14.5 },
  { indian: 8,  us: '4',    diameter: 14.9 },
  { indian: 9,  us: '4½',   diameter: 15.3 },
  { indian: 10, us: '5',    diameter: 15.7 },
  { indian: 11, us: '5½',   diameter: 16.1 },
  { indian: 12, us: '6',    diameter: 16.5 },
  { indian: 13, us: '6½',   diameter: 16.9 },
  { indian: 14, us: '7',    diameter: 17.3 },
  { indian: 15, us: '7½',   diameter: 17.7 },
  { indian: 16, us: '8',    diameter: 18.1 },
  { indian: 17, us: '8½',   diameter: 18.5 },
  { indian: 18, us: '9',    diameter: 18.9 },
  { indian: 19, us: '9½',   diameter: 19.3 },
  { indian: 20, us: '10',   diameter: 19.7 },
  { indian: 21, us: '10½',  diameter: 20.1 },
  { indian: 22, us: '11',   diameter: 20.5 },
  { indian: 23, us: '11½',  diameter: 20.9 },
  { indian: 24, us: '12',   diameter: 21.3 },
  { indian: 25, us: '12½',  diameter: 21.7 },
];

const steps = [
  {
    step: '01',
    title: 'Cut a strip of paper',
    desc: 'Cut a thin strip of paper about 1 cm wide and long enough to wrap around your finger.',
  },
  {
    step: '02',
    title: 'Wrap it around your finger',
    desc: 'Wrap the strip snugly around the base of the finger you plan to wear the ring on. Make sure it fits comfortably — not too tight.',
  },
  {
    step: '03',
    title: 'Mark the overlap',
    desc: 'Use a pen to mark where the paper overlaps. This marks the inner circumference of your ring.',
  },
  {
    step: '04',
    title: 'Measure the length',
    desc: 'Lay the paper flat and measure the marked length in millimetres. Divide by π (3.14) to get your inner diameter.',
  },
  {
    step: '05',
    title: 'Match to the chart',
    desc: 'Find the closest diameter value in the size chart above. That is your Indian ring size.',
  },
];

export default function SizeGuidePage() {
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
            Size{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent italic">
              Guide
            </span>
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="text-white/45 font-light leading-relaxed">
            Find your perfect fit. Use the charts below or follow our simple at-home measuring guide.
          </p>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-20">

        {/* Ring Size Chart */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="7" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-white">Ring Sizes</h2>
              <div className="w-12 h-[1px] bg-gold/40 mt-2" />
            </div>
          </div>

          <div className="overflow-hidden border border-white/8 rounded-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gold/10 border-b border-white/8">
                  <th className="py-4 px-6 text-left text-gold tracking-[0.15em] uppercase text-xs font-semibold">
                    Indian Size
                  </th>
                  <th className="py-4 px-6 text-left text-gold tracking-[0.15em] uppercase text-xs font-semibold">
                    US Size
                  </th>
                  <th className="py-4 px-6 text-left text-gold tracking-[0.15em] uppercase text-xs font-semibold">
                    Diameter (mm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {ringSizes.map((row, i) => (
                  <tr
                    key={row.indian}
                    className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/4 ${
                      i % 2 === 0 ? 'bg-white/[0.015]' : 'bg-transparent'
                    }`}
                  >
                    <td className="py-3.5 px-6 text-white font-medium">{row.indian}</td>
                    <td className="py-3.5 px-6 text-white/70">{row.us}</td>
                    <td className="py-3.5 px-6 text-white/70">{row.diameter.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-white/30 text-xs mt-4 text-center">
            If you are between sizes, we recommend sizing up for comfort.
          </p>
        </motion.section>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bracelet Size */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-white">Bracelet Size</h2>
              <div className="w-12 h-[1px] bg-gold/40 mt-2" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-gold/20 bg-gold/5 p-10 rounded-sm text-center"
          >
            <p className="text-gold/70 tracking-[0.3em] uppercase text-xs mb-4">✦ Standard Fit</p>
            <p className="font-serif text-5xl text-white mb-3">17 – 18 cm</p>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mb-5" />
            <p className="text-white/50 text-sm font-light max-w-md mx-auto leading-relaxed">
              All Surya Jewellers bracelets are crafted in a standard length of 17–18 cm, designed to fit most wrists with a comfortable, elegant drape. If you have a specific wrist size requirement, please reach out to us for a custom order.
            </p>
            <p className="text-white/30 text-xs mt-6">
              Tip: Measure your wrist snugly with a tape measure, then add 1–2 cm for comfort.
            </p>
          </motion.div>
        </motion.section>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* How to Measure */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-white">How to Measure at Home</h2>
              <div className="w-12 h-[1px] bg-gold/40 mt-2" />
            </div>
          </div>

          <p className="text-white/40 text-sm font-light mb-8">
            All you need is a thin strip of paper and a ruler. Follow these steps to find your ring size accurately.
          </p>

          <div className="space-y-4">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-6 border border-white/8 bg-white/3 hover:bg-white/5 hover:border-gold/20 transition-all duration-300 p-6 rounded-sm group"
              >
                <span className="font-serif text-3xl text-gold/20 group-hover:text-gold/40 transition-colors duration-300 flex-shrink-0 leading-none">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-serif text-base text-white mb-1.5 group-hover:text-gold-light transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 border border-gold/20 bg-gold/5 p-6 rounded-sm"
          >
            <p className="text-gold/70 text-xs tracking-[0.2em] uppercase mb-2">✦ Pro Tip</p>
            <p className="text-white/50 text-sm font-light leading-relaxed">
              Measure your finger at the end of the day when fingers are slightly larger. Avoid measuring when your hands are cold. If your knuckle is larger than the base of your finger, size up.
            </p>
          </motion.div>
        </motion.section>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-white/8 bg-white/3 p-8 rounded-sm text-center"
        >
          <p className="text-gold/70 tracking-[0.3em] uppercase text-xs mb-3">✦ Still Unsure?</p>
          <h3 className="font-serif text-xl text-white mb-4">We Are Here to Help</h3>
          <p className="text-white/50 text-sm font-light mb-6 max-w-md mx-auto">
            Contact us and our team will guide you to the perfect size before you place your order.
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
