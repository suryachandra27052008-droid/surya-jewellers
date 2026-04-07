import { SignUp } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

const clerkAppearance = {
  variables: {
    colorPrimary: '#D4AF37',
    colorBackground: 'transparent',
    colorText: 'rgba(255,255,255,0.92)',
    colorTextSecondary: 'rgba(255,255,255,0.45)',
    colorInputBackground: 'rgba(255,255,255,0.04)',
    colorInputText: 'rgba(255,255,255,0.92)',
    colorNeutral: '#555555',
    borderRadius: '2px',
    fontFamily: 'inherit',
    fontSize: '14px',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none border-0 p-0 gap-5',
    headerTitle: 'font-serif text-white text-2xl tracking-wide text-left',
    headerSubtitle: 'text-white/40 text-sm font-light text-left',
    socialButtonsBlockButton:
      'border border-white/12 bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:border-gold/30 transition-all duration-300 rounded-sm h-11',
    socialButtonsBlockButtonText: 'text-white/75 text-sm tracking-wide font-normal',
    socialButtonsBlockButtonArrow: 'hidden',
    dividerLine: 'bg-white/8',
    dividerText: 'text-white/20 text-xs tracking-[0.2em] uppercase',
    formFieldLabel: 'text-white/40 text-[11px] tracking-[0.18em] uppercase mb-1',
    formFieldInput:
      'bg-white/[0.04] border border-white/10 text-white/90 placeholder-white/15 focus:border-gold/50 focus:ring-0 focus:bg-white/[0.06] rounded-sm h-11 px-4 transition-all duration-200',
    formButtonPrimary:
      'bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-charcoal tracking-[0.18em] uppercase text-[11px] font-semibold rounded-sm h-11 transition-all duration-300 shadow-lg shadow-gold/20',
    footerActionLink: 'text-gold hover:text-gold-light transition-colors duration-200 font-normal',
    footerActionText: 'text-white/35 text-sm',
    identityPreviewText: 'text-white/70',
    identityPreviewEditButton: 'text-gold hover:text-gold-light',
    formFieldSuccessText: 'text-emerald-400/80 text-xs',
    formFieldErrorText: 'text-red-400/80 text-xs',
    alertText: 'text-white/55 text-xs',
    formResendCodeLink: 'text-gold hover:text-gold-light',
    otpCodeFieldInput: 'border-white/10 bg-white/[0.04] text-white rounded-sm',
    footer: 'mt-2',
    internal: 'gap-4',
    formFieldRow: 'gap-4',
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#080808' }}>

      {/* ── Left Panel: Brand Story ─────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0d0d0d 0%, #111008 40%, #0a0a05 100%)',
        }}
      >
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Gold glow blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />

        {/* Thin gold border on right edge */}
        <div className="absolute top-0 right-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(212,175,55,0.25) 30%, rgba(212,175,55,0.25) 70%, transparent)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-14 py-12">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo_sj.webp" alt="Surya Jewellers" width={36} height={36}
              className="opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="font-serif text-white/80 text-lg tracking-wider group-hover:text-white transition-colors">
              Surya Jewellers
            </span>
          </Link>

          {/* Centre hero text */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            {/* Ornamental top line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 max-w-[40px]" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5))' }} />
              <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: 'rgba(212,175,55,0.5)' }}>Join Us</span>
              <div className="h-px flex-1 max-w-[40px]" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.5))' }} />
            </div>

            <h1 className="font-serif text-white/90 leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>
              Begin your<br />
              <span style={{ color: '#D4AF37' }}>jewellery</span><br />
              journey.
            </h1>

            <p className="text-white/35 text-sm leading-relaxed mb-10 max-w-xs">
              Create an account to save your favourites, receive exclusive early access to new collections, and enjoy a seamless checkout experience.
            </p>

            {/* Member perks */}
            <div className="space-y-4">
              {[
                { icon: '✦', label: 'Early access to new arrivals' },
                { icon: '✦', label: 'Exclusive member-only offers' },
                { icon: '✦', label: 'Order tracking & history' },
                { icon: '✦', label: 'Saved wishlist & size preferences' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-[10px]" style={{ color: 'rgba(212,175,55,0.6)' }}>{icon}</span>
                  <span className="text-white/30 text-xs tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, rgba(212,175,55,0.15), transparent)' }} />
            <span className="text-[10px] tracking-[0.3em] text-white/15 uppercase">Surya Jewellers</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-16 relative overflow-hidden">

        {/* Subtle glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)' }} />

        {/* Mobile logo (only visible on small screens) */}
        <div className="lg:hidden mb-10 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Image src="/logo_sj.webp" alt="Surya Jewellers" width={44} height={44} className="opacity-90" />
            <span className="font-serif text-white/70 text-sm tracking-widest uppercase">Surya Jewellers</span>
          </Link>
          <div className="mt-4 h-px w-16 mx-auto" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)' }} />
        </div>

        <div className="relative z-10 w-full max-w-[400px]">

          {/* Card container */}
          <div
            className="p-8 sm:p-10 rounded-sm"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none"
              style={{ borderTop: '1px solid rgba(212,175,55,0.4)', borderLeft: '1px solid rgba(212,175,55,0.4)' }} />
            <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none"
              style={{ borderTop: '1px solid rgba(212,175,55,0.4)', borderRight: '1px solid rgba(212,175,55,0.4)' }} />
            <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none"
              style={{ borderBottom: '1px solid rgba(212,175,55,0.4)', borderLeft: '1px solid rgba(212,175,55,0.4)' }} />
            <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
              style={{ borderBottom: '1px solid rgba(212,175,55,0.4)', borderRight: '1px solid rgba(212,175,55,0.4)' }} />

            <SignUp appearance={clerkAppearance} />
          </div>

          {/* Back to store link */}
          <p className="text-center mt-6 text-white/20 text-xs tracking-wide">
            <Link href="/" className="hover:text-gold/60 transition-colors duration-200">
              ← Return to store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
