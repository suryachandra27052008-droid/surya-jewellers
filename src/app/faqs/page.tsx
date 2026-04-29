import type { Metadata } from 'next';
import Link from 'next/link';
import { faqs, faqSchema } from '@/data/faqs';

export const metadata: Metadata = {
  title: { absolute: 'FAQs | Surya Jewellers Jaipur' },
  description:
    'Answers about Surya Jewellers 92.5 sterling silver jewellery, certificates, shipping, returns, showroom visits, wholesale, gemstones and care.',
  alternates: {
    canonical: 'https://www.suryajewellers.com/faqs',
  },
};

export default function FaqsPage() {
  return (
    <main className="bg-cream py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">Help & Information</span>
          <h1 className="font-serif text-3xl sm:text-5xl mt-4 text-charcoal">
            Frequently Asked Questions
          </h1>
          <p className="text-charcoal-muted text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
            Everything customers usually ask before choosing a handcrafted 92.5 sterling silver piece from Surya Jewellers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <section key={faq.question} className="border border-cream-dark rounded bg-white p-5 sm:p-6">
              <h2 className="font-serif text-lg sm:text-xl text-charcoal mb-3">{faq.question}</h2>
              <p className="text-charcoal-muted text-sm leading-relaxed">{faq.answer}</p>
            </section>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/contact" className="inline-flex items-center justify-center btn-gold min-h-[44px] px-6 rounded">
            Ask a Question
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}
