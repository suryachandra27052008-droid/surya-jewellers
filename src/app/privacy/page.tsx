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
    title: 'Social Sign-In',
    body: [
      'If you choose a social sign-in option, Clerk receives the profile information supplied by that provider to create or authenticate your Surya Jewellers account. This can include your name, email address, profile picture, and a provider account identifier.',
      'Our Facebook login connection requests basic profile and email access only. It does not request access to your friends, messages, posts, or advertising accounts. Social sign-in is not permission to send you marketing messages.',
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
    title: 'Optional Shopping Analytics',
    body: [
      'With your permission, we count sessions that view products, add an item to the bag, start checkout, and complete a purchase. We store the stage, date, broad device category and country, not names, email addresses, delivery addresses, form entries or full IP addresses.',
      'A random browser session identifier is hashed on our server and used to avoid duplicate counts. We do not collect these optional events before consent, and honour Do Not Track and Global Privacy Control. You can change your choice through Analytics preferences in the website footer. Analytics records are retained for up to 90 days.',
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
          Last updated: 4 November 2026. This policy explains how information is handled when you use
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

          <section id="data-deletion" className="scroll-mt-28">
            <h2 className="font-serif text-2xl text-white">Delete Your Account or Facebook Login Data</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-white/60">
              <li>
                Email{' '}
                <a href="mailto:suryajewellersjaipur@gmail.com?subject=Account%20or%20Facebook%20data%20deletion%20request" className="text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-light">
                  suryajewellersjaipur@gmail.com
                </a>{' '}
                from the email address associated with your Surya Jewellers account, with the subject
                &ldquo;Account or Facebook data deletion request&rdquo;.
              </li>
              <li>
                Tell us whether you want to delete your account, information received through Facebook
                Login, or other personal information we hold. Do not send passwords, verification codes,
                or payment card details.
              </li>
              <li>
                Our team will review the request and may ask you to verify that you control the account
                before removing information that we can delete. If you cannot access your account email,
                contact us for help verifying ownership.
              </li>
            </ol>
            <p className="mt-4 text-sm leading-7 text-white/60">
              Some order, payment, and related records may need to be retained for legal, accounting,
              transaction-record, or fraud-prevention obligations. Removing Surya Jewellers from your
              Facebook Apps and Websites settings disconnects that Facebook connection; it does not by
              itself delete all information already held by Surya Jewellers. Use the email request above
              to request deletion of that information. Deletion requests are handled by our team, not
              by an automatic deletion button.
            </p>
          </section>

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
