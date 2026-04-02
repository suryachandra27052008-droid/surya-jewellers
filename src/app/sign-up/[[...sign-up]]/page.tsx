import { SignUp } from '@clerk/nextjs';

const clerkAppearance = {
  variables: {
    colorPrimary: '#D4AF37',
    colorBackground: '#111111',
    colorText: 'rgba(255,255,255,0.9)',
    colorTextSecondary: 'rgba(255,255,255,0.5)',
    colorInputBackground: 'rgba(255,255,255,0.06)',
    colorInputText: 'rgba(255,255,255,0.9)',
    colorNeutral: '#666666',
    borderRadius: '2px',
    fontFamily: 'inherit',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-transparent shadow-none border-0 p-0 gap-6',
    headerTitle: 'font-serif text-white text-2xl tracking-wide',
    headerSubtitle: 'text-white/40 text-sm font-light',
    socialButtonsBlockButton:
      'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-sm',
    socialButtonsBlockButtonText: 'text-white/70 text-sm tracking-wide',
    dividerLine: 'bg-white/10',
    dividerText: 'text-white/25 text-xs tracking-widest uppercase',
    formFieldLabel: 'text-white/40 text-xs tracking-[0.15em] uppercase',
    formFieldInput:
      'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-gold/50 focus:bg-white/8 rounded-sm',
    formButtonPrimary:
      'bg-gold hover:bg-gold-dark text-white tracking-[0.15em] uppercase text-xs font-medium rounded-sm transition-colors duration-300',
    footerActionLink: 'text-gold hover:text-gold-light transition-colors duration-300',
    footerActionText: 'text-white/40 text-sm',
    formFieldSuccessText: 'text-green-400/80',
    formFieldErrorText: 'text-red-400/80',
    otpCodeFieldInput: 'border-white/10 bg-white/5 text-white',
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-gold/70 tracking-[0.4em] uppercase text-xs font-medium mb-4">
            ✦ &nbsp; Surya Jewellers &nbsp; ✦
          </p>
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto" />
        </div>

        <div className="border border-white/8 bg-white/3 backdrop-blur-sm p-8 rounded-sm">
          <SignUp appearance={clerkAppearance} />
        </div>
      </div>
    </div>
  );
}
