'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';

const reasons = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: '90% One Piece, One Design',
    desc: 'Nearly every design we produce is exclusive — crafted once and never mass-replicated. Your customers receive jewellery they will not find anywhere else.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    title: 'Certified 92.5 Sterling Silver',
    desc: 'All pieces are crafted in certified 92.5 sterling silver and come with a Certificate of Authenticity — giving your customers the assurance of verified quality.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: 'Natural Diamonds & Precious Gemstones',
    desc: 'We use only natural, certified diamonds and genuine precious gemstones — no synthetics. Every stone comes with a certificate of authenticity.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: 'Manufacturer Direct Pricing',
    desc: 'We are manufacturers, not middlemen. You benefit from factory-direct pricing, better margins, and the flexibility to discuss custom requirements.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'International Shipping Available',
    desc: 'We ship globally and actively participate in international jewellery shows in Hong Kong, Bangkok, and across Europe — we understand global markets.',
  },
];

const productOptions = [
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Pendants',
  'Studs',
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function WholesalePage() {
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    country: '',
    phone: '',
    email: '',
    products: [] as string[],
    monthlyRequirement: '',
    message: '',
  });
  const [status, setStatus] = useState<FormState>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleProduct = (product: string) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter((p) => p !== product)
        : [...prev.products, product],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({
          companyName: '',
          contactPerson: '',
          country: '',
          phone: '',
          email: '',
          products: [],
          monthlyRequirement: '',
          message: '',
        });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-gold/50 focus:bg-white/8 transition-all duration-300';

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
          className="relative z-10 max-w-3xl mx-auto"
        >
          <p className="text-gold/70 tracking-[0.4em] uppercase text-xs font-medium mb-6">
            ✦ &nbsp; Wholesale &amp; B2B &nbsp; ✦
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-white leading-tight mb-5">
            Partner{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent italic">
              With Us
            </span>
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="text-white/45 font-light leading-relaxed text-lg max-w-2xl mx-auto">
            We supply premium 92.5 sterling silver jewellery to retailers and wholesalers across India and internationally.
            We participate in jewellery shows in Hong Kong, Bangkok, and Europe — bringing Jaipur&apos;s finest craftsmanship to the world.
          </p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-24">

        {/* Why Partner With Us */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <p className="text-gold/70 tracking-[0.35em] uppercase text-xs font-medium mb-4">
              ✦ &nbsp; Why Choose Us &nbsp; ✦
            </p>
            <h2 className="font-serif text-4xl text-white mb-3">Why Partner With Surya?</h2>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reasons.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="border border-white/8 bg-white/3 hover:bg-white/5 hover:border-gold/25 transition-all duration-300 p-7 rounded-sm group"
              >
                <div className="w-10 h-10 rounded-full border border-gold/25 bg-gold/10 flex items-center justify-center text-gold mb-5 group-hover:border-gold/50 group-hover:bg-gold/15 transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg text-white mb-3 group-hover:text-gold-light transition-colors duration-300 leading-snug">
                  {item.title}
                </h3>
                <p className="text-white/45 text-sm font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Enquiry Form */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-white">Wholesale Enquiry</h2>
              <div className="w-12 h-[1px] bg-gold/40 mt-2" />
            </div>
          </div>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-gold/30 bg-gold/8 p-12 rounded-sm text-center max-w-xl mx-auto"
            >
              <p className="text-gold text-3xl mb-4">✦</p>
              <h3 className="font-serif text-2xl text-white mb-3">Enquiry Received</h3>
              <p className="text-white/50 text-sm font-light leading-relaxed mb-6">
                Thank you for your interest in partnering with Surya Jewellers. Our team will review your enquiry and get back to you within 48 hours.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-gold text-sm hover:text-gold-light transition-colors duration-300 underline underline-offset-4"
              >
                Submit another enquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
              {/* Company & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                    Company Name <span className="text-gold/60">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Your company or store name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                    Contact Person <span className="text-gold/60">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Country & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="e.g. India, UAE, USA"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                  Email <span className="text-gold/60">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="business@example.com"
                  className={inputClass}
                />
              </div>

              {/* Product Types */}
              <div>
                <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-3">
                  Products Interested In
                </label>
                <div className="flex flex-wrap gap-3">
                  {productOptions.map((product) => {
                    const selected = form.products.includes(product);
                    return (
                      <button
                        key={product}
                        type="button"
                        onClick={() => toggleProduct(product)}
                        className={`px-4 py-2 text-xs tracking-[0.12em] uppercase border rounded-sm transition-all duration-300 ${
                          selected
                            ? 'border-gold bg-gold/15 text-gold'
                            : 'border-white/10 bg-white/3 text-white/50 hover:border-white/25 hover:text-white/70'
                        }`}
                      >
                        {product}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Requirement */}
              <div>
                <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                  Approximate Monthly Requirement
                </label>
                <select
                  name="monthlyRequirement"
                  value={form.monthlyRequirement}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-[#1a1a1a]">Select a range</option>
                  <option value="Under 50 pieces" className="bg-[#1a1a1a]">Under 50 pieces</option>
                  <option value="50–200 pieces" className="bg-[#1a1a1a]">50–200 pieces</option>
                  <option value="200–500 pieces" className="bg-[#1a1a1a]">200–500 pieces</option>
                  <option value="500–1000 pieces" className="bg-[#1a1a1a]">500–1000 pieces</option>
                  <option value="1000+ pieces" className="bg-[#1a1a1a]">1000+ pieces</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your business, specific requirements, or any questions you have..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {status === 'error' && (
                <p className="text-red-400/80 text-sm">
                  Something went wrong. Please try again or email us directly at suryajewellersjaipur@gmail.com
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-gold text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </motion.section>

        {/* Direct Contact Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-gold/20 bg-gold/5 p-8 rounded-sm text-center"
        >
          <p className="text-gold/70 tracking-[0.3em] uppercase text-xs mb-3">✦ Prefer to Talk Directly?</p>
          <h3 className="font-serif text-xl text-white mb-4">Reach Our Trade Team</h3>
          <p className="text-white/45 text-sm font-light mb-6 max-w-md mx-auto">
            For urgent enquiries or to speak with someone directly, contact us via email or WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm">
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
              href="https://wa.me/919983939306"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp: +91 99839 39306
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
