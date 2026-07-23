import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Surya Jewellers',
  description:
    'How Surya Jewellers collects, uses, protects, and retains information provided through our website.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/privacy',
  },
};

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'We collect the details you provide when you create an account, place an order, contact us, submit a wholesale enquiry, or communicate with our team. This may include your name, email address, phone number, delivery address, order details, company information, and enquiry message.',
      'We may also receive limited technical information needed to operate and protect the website, such as browser details, device information, IP-derived security signals, and request timestamps.',
    ],
  },
  {
    title: 'How We Use Information',
    body: [
      'We use this information to process orders and payments, deliver purchases, provide customer support, respond to enquiries, prevent abuse, maintain website security, and improve our services.',
      'Payment card details are handled by our payment providers and are not stored directly by Surya Jewellers.',
    ],
  },
  {
    title: 'Verified Enquiries',
    body: [
      'Contact and wholesale enquiries require a one-time code sent to the supplied email address. This confirms that the sender can access that mailbox before an enquiry is delivered to us.',
      'Temporary verification records include hashed email and network identifiers, expiry and attempt information, and verification status. Codes expire after 10 minutes. Raw verification email and code data are removed from the temporary record after successful verification, and expired records are deleted by a scheduled cleanup.',
    ],
  },
  {
    title: 'Service Providers',
    body: [
      'We use trusted service providers to operate the website, including Vercel for hosting, Sanity for content and temporary verification records, Resend for transactional email, Clerk for account authentication, and payment providers selected at checkout.',
    ],
  },
  {
    title: 'Your Choices',
    body: [
      'You may ask us to correct or delete personal information that we control, subject to legal, accounting, fraud-prevention, and transaction-record obligations. You may also contact us with questions about how your information is handled.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-5 pb-24 pt-36 text-white sm:px-8 sm:pt-40">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">Surya Jewellers</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Privacy Policy</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55">
          Last updated: 23 July 2026. This policy explains how information is handled when you use
          suryajewellers.com.
        </p>

        <div className="mt-12 space-y-10 border-t border-white/10 pt-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl text-white">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/60">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="font-serif text-2xl text-white">Bot Protection</h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              We use Cloudflare Turnstile to protect enquiry forms from automated abuse. Turnstile
              processes security signals under Cloudflare&apos;s{' '}
              <a
                href="https://www.cloudflare.com/turnstile-privacy-policy/"
                target="_blank"
                rel="noreferrer"
                className="text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light"
              >
                Turnstile Privacy Addendum
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-white">Contact</h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              For privacy questions, email{' '}
              <a
                href="mailto:suryajewellersjaipur@gmail.com"
                className="text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light"
              >
                suryajewellersjaipur@gmail.com
              </a>{' '}
              or write to B-169 Anandpuri, Moti Doongri Road, Jaipur, Rajasthan 302004, India.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
