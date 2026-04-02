'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';

const storeDetails = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: 'Address',
    value: 'B-169 Anandpuri, Moti Doongri Rd,\nnear Naila House,\nJaipur, Rajasthan 302004',
    link: 'https://www.google.com/maps/dir/?api=1&destination=B-169+Anandpuri+Moti+Doongri+Rd+near+Naila+House+Jaipur+Rajasthan+302004',
    linkLabel: 'Get Directions',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: 'Phone',
    value: '099839 39306\n9358842102',
    link: 'tel:+919983939306',
    linkLabel: 'Call Now',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: 'Email',
    value: 'suryajewellersjaipur@gmail.com',
    link: 'mailto:suryajewellersjaipur@gmail.com',
    linkLabel: 'Send Email',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: '099839 39306',
    link: 'https://wa.me/919983939306',
    linkLabel: 'Chat on WhatsApp',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Business Hours',
    value: 'Monday – Saturday\n10:00 AM – 8:00 PM',
    link: null,
    linkLabel: null,
  },
];

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<FormState>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', message: '' });
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
          className="relative z-10 max-w-2xl mx-auto"
        >
          <p className="text-gold/70 tracking-[0.4em] uppercase text-xs font-medium mb-6">
            ✦ &nbsp; Surya Jewellers &nbsp; ✦
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-white leading-tight mb-5">
            Get in{' '}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent italic">
              Touch
            </span>
          </h1>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-6" />
          <p className="text-white/45 font-light leading-relaxed">
            Whether you have a question about a piece, need help with sizing, or want a custom creation — we are here.
          </p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Form + Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-20">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-3xl text-white">Send a Message</h2>
                <div className="w-12 h-[1px] bg-gold/40 mt-2" />
              </div>
            </div>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-gold/30 bg-gold/8 p-10 rounded-sm text-center"
              >
                <p className="text-gold text-3xl mb-4">✦</p>
                <h3 className="font-serif text-2xl text-white mb-3">Message Received</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed mb-6">
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-gold text-sm hover:text-gold-light transition-colors duration-300 underline underline-offset-4"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                      Name <span className="text-gold/60">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>
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
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>
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

                <div>
                  <label className="text-white/40 text-xs tracking-[0.15em] uppercase block mb-2">
                    Message <span className="text-gold/60">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help — about a specific piece, custom order, sizing, or anything else..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-400/80 text-sm">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-gold w-full sm:w-auto text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Store Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <div>
                <h2 className="font-serif text-3xl text-white">Store Details</h2>
                <div className="w-12 h-[1px] bg-gold/40 mt-2" />
              </div>
            </div>

            <div className="space-y-4">
              {storeDetails.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border border-white/8 bg-white/3 hover:bg-white/5 hover:border-gold/20 transition-all duration-300 p-5 rounded-sm group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full border border-gold/20 bg-gold/8 flex items-center justify-center flex-shrink-0 mt-0.5 text-gold group-hover:border-gold/40 transition-colors duration-300">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gold/60 text-xs tracking-[0.15em] uppercase mb-1.5">{item.label}</p>
                      <p className="text-white/80 text-sm font-light leading-relaxed whitespace-pre-line">
                        {item.value}
                      </p>
                      {item.link && (
                        <a
                          href={item.link}
                          target={item.link.startsWith('http') ? '_blank' : undefined}
                          rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="inline-block mt-2 text-gold/60 hover:text-gold text-xs tracking-[0.1em] uppercase transition-colors duration-300"
                        >
                          {item.linkLabel} →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

        {/* Map */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <p className="text-gold/70 tracking-[0.35em] uppercase text-xs font-medium mb-4">
              ✦ &nbsp; Find Us &nbsp; ✦
            </p>
            <h2 className="font-serif text-3xl text-white mb-3">Visit Our Studio</h2>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-4" />
            <p className="text-white/35 text-sm font-light">
              B-169 Anandpuri, Moti Doongri Rd, near Naila House, Jaipur, Rajasthan 302004
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-br from-gold/20 via-transparent to-gold/10 rounded-sm z-0" />
            <div className="relative z-10 overflow-hidden rounded-sm">
              <iframe
                title="Surya Jewellers Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.9585720482346!2d75.82120473955301!3d26.904809860527966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db6b98c851fff%3A0x2406d9efdc66cfff!2sSurya%20Jewellers!5e0!3m2!1sen!2sin!4v1775133965158!5m2!1sen!2sin"
                width="100%"
                height="420"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.8) brightness(0.85)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=B-169+Anandpuri+Moti+Doongri+Rd+near+Naila+House+Jaipur+Rajasthan+302004"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 btn-gold text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Get Directions
            </a>
          </div>
        </motion.section>

        {/* Bottom nav */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center pt-20"
        >
          <Link href="/products" className="btn-gold inline-block text-xs">
            Browse Collections
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
