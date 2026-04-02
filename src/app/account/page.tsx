'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.emailAddresses[0]?.emailAddress[0].toUpperCase()
    : '?';

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Member'
    : 'Member';

  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center mb-5 overflow-hidden">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-2xl text-gold">{initials}</span>
            )}
          </div>

          <p className="text-gold/70 tracking-[0.4em] uppercase text-xs font-medium mb-2">
            ✦ &nbsp; My Account &nbsp; ✦
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-2">{fullName}</h1>
          <p className="text-white/35 text-sm font-light">{email}</p>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mt-6" />
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-8">

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              ),
              label: 'Browse Collections',
              href: '/products',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              ),
              label: 'Size Guide',
              href: '/blog/size-guide',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              ),
              label: 'Contact Us',
              href: '/contact',
            },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="flex items-center gap-4 border border-white/8 bg-white/3 hover:bg-white/6 hover:border-gold/25 transition-all duration-300 p-5 rounded-sm group"
            >
              <div className="w-9 h-9 rounded-full border border-gold/20 bg-gold/8 flex items-center justify-center text-gold flex-shrink-0 group-hover:border-gold/40 transition-colors duration-300">
                {action.icon}
              </div>
              <span className="text-white/70 text-sm group-hover:text-white transition-colors duration-300">
                {action.label}
              </span>
            </Link>
          ))}
        </motion.div>

        {/* Orders Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white">My Orders</h2>
              <div className="w-10 h-[1px] bg-gold/40 mt-1.5" />
            </div>
          </div>

          <div className="border border-white/8 bg-white/3 p-10 rounded-sm text-center">
            <p className="text-gold/50 text-2xl mb-4">✦</p>
            <h3 className="font-serif text-lg text-white mb-3">No Orders Yet</h3>
            <p className="text-white/40 text-sm font-light max-w-sm mx-auto leading-relaxed mb-6">
              Your order history will appear here. Each confirmed order is also sent to your email with tracking details.
            </p>
            <Link href="/products" className="btn-gold inline-block text-xs">
              Start Shopping
            </Link>
          </div>
        </motion.section>

        {/* Account Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white">Account Details</h2>
              <div className="w-10 h-[1px] bg-gold/40 mt-1.5" />
            </div>
          </div>

          <div className="border border-white/8 bg-white/3 rounded-sm divide-y divide-white/5">
            {[
              { label: 'Full Name', value: fullName },
              { label: 'Email', value: email },
              {
                label: 'Member Since',
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                    })
                  : '—',
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <span className="text-white/35 text-xs tracking-[0.15em] uppercase">{row.label}</span>
                <span className="text-white/75 text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center pt-4"
        >
          <SignOutButton redirectUrl="/">
            <button className="flex items-center gap-2 text-white/35 hover:text-red-400/70 text-sm transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </SignOutButton>
        </motion.div>
      </div>
    </div>
  );
}
