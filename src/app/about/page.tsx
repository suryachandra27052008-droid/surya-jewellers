'use client';

import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Globe2, Diamond, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Editorial Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col justify-center items-center text-center px-4">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-white opacity-80" />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative max-w-4xl mx-auto z-10"
        >
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <span className="px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium tracking-wide uppercase">
              Established 2003
            </span>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-serif text-gray-900 tracking-tight leading-tight mb-8"
          >
            A Legacy of <span className="text-amber-600 italic">Craftsmanship</span> & Heritage
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light"
          >
            We are Surya Jewellers. From our humble beginnings in Jaipur to gracing international stages, we craft stories in 92.5 Sterling Silver, Natural Diamonds, and Precious Gemstones.
          </motion.p>
        </motion.div>
      </section>

      {/* Our Story & Founders */}
      <section className="py-24 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center"
          >
            <div className="relative">
               <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center p-8 text-center border border-gray-200 rounded-2xl relative overflow-hidden">
                 {/* Abstract editorial piece instead of fake photos */}
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent blur-3xl"></div>
                 <div className="z-10 flex flex-col items-center">
                    <HeartHandshake className="w-16 h-16 text-amber-300 mb-6" strokeWidth={1} />
                    <h3 className="text-3xl font-serif text-gray-800 mb-2">Sanjay Chandra</h3>
                    <h3 className="text-3xl font-serif text-gray-800 mb-6">& Pooja Chandra</h3>
                    <div className="w-12 h-[1px] bg-amber-300 mb-6"></div>
                    <p className="text-gray-500 font-light tracking-widest uppercase text-sm">The Founders</p>
                 </div>
               </div>
            </div>

            <div>
              <h2 className="text-sm tracking-widest uppercase text-amber-600 font-semibold mb-3">Our Story</h2>
              <h3 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6 leading-tight">
                Built on Love, Trust,<br />and Family Heritage.
              </h3>
              <div className="space-y-6 text-gray-600 text-lg font-light leading-relaxed">
                <p>
                  Established in the early 2000s and officially registered in 2003, Surya Jewellers is a true reflection of family dedication. Founded by passionate jewellery craftsman Sanjay Chandra, the brand blossomed when his wife, Pooja Chandra, joined the journey.
                </p>
                <p>
                  Together, they transformed a shared passion into a globally recognized manufacturing house right from the heart of Jaipur, Rajasthan.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Craftsmanship Philosophy */}
      <section className="py-24 md:py-32 bg-gray-900 text-white relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Diamond className="w-10 h-10 text-amber-400 mx-auto mb-6 opacity-80" strokeWidth={1.5} />
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Our Signature Philosophy</h2>
            <p className="text-xl text-gray-400 font-light leading-relaxed">
              We do not mass produce. <span className="text-white font-medium">90% of our designs are one-piece, one-design creations.</span> Every jewel is a uniquely sculpted work of art.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Premium Materials",
                desc: "Every piece is crafted in pure 92.5 Sterling Silver, serving as the perfect canvas for our artistry.",
              },
              {
                title: "Natural Brilliance",
                desc: "We exclusively set our jewelry with natural diamonds and precious gemstones, completely avoiding synthetics.",
              },
              {
                title: "Exquisite Range",
                desc: "From statement Necklaces and Pendants to delicate Rings, Earrings, Bracelets, and Studs.",
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="border border-white/10 bg-white/5 p-10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <h3 className="text-2xl font-serif mb-4 text-amber-300">{feature.title}</h3>
                <p className="text-gray-300 font-light leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8">
               <Globe2 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-6">A Global Footprint</h2>
            <p className="text-lg text-gray-600 mb-12 font-light leading-relaxed">
              While our roots run deep in the heritage city of Jaipur, our reach is truly international. We cater to esteemed retailers, wholesalers, and direct customers across India and worldwide. 
             <br /><br />
             We actively showcase Jaipur's finest craftsmanship on the world stage, regularly participating in international jewellery shows across <strong>Hong Kong, Bangkok, and Europe</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact & Location Strip */}
      <section className="bg-amber-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-white/20">
             
             <div className="flex flex-col items-center md:items-start px-8 py-4 md:py-0">
               <MapPin className="w-6 h-6 text-amber-400 mb-4" />
               <h4 className="text-lg font-serif mb-2">Visit Our Studio</h4>
               <p className="text-amber-100/70 font-light text-sm leading-relaxed">
                 B-169 Anandpuri,<br/>
                 Moti Doongri Rd, near Naila House,<br/>
                 Jaipur, Rajasthan 302004
               </p>
             </div>

             <div className="flex flex-col items-center md:items-center px-8 py-4 md:py-0">
               <Phone className="w-6 h-6 text-amber-400 mb-4" />
               <h4 className="text-lg font-serif mb-2">Call Us</h4>
               <p className="text-amber-100/70 font-light text-sm">
                 099839 39306
               </p>
             </div>

             <div className="flex flex-col items-center md:items-end px-8 py-4 md:py-0 text-center md:text-right">
               <Mail className="w-6 h-6 text-amber-400 mb-4" />
               <h4 className="text-lg font-serif mb-2">Email Us</h4>
               <p className="text-amber-100/70 font-light text-sm hover:text-white transition-colors">
                 <a href="mailto:info@suryajewellers.com">info@suryajewellers.com</a>
               </p>
             </div>

           </div>
        </div>
      </section>
    </div>
  );
}
