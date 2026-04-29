export const faqs = [
  {
    question: 'What is 92.5 Sterling Silver?',
    answer:
      '92.5 Sterling Silver, also known as 925 silver, is an alloy composed of 92.5% pure silver and 7.5% other metals (usually copper). This composition gives it the strength needed for jewellery-making while retaining the brilliant lustre of pure silver. All Surya Jewellers pieces are hallmarked 92.5 sterling silver.',
  },
  {
    question: 'Do your pieces come with a Certificate of Authenticity?',
    answer:
      'Yes. Every piece from Surya Jewellers is accompanied by a Certificate of Authenticity that verifies the 92.5 sterling silver purity, the type and carat weight of natural gemstones used, and the craftsmanship standards of our Jaipur workshop.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes, Surya Jewellers ships internationally. We have served customers across India, the United States, the United Kingdom, Australia, the Middle East, and Southeast Asia. International orders are carefully packaged and fully insured during transit.',
  },
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 7-day return and exchange policy on all unworn pieces in their original condition. Custom or personalised orders are non-returnable. Please contact us at suryajewellersjaipur@gmail.com or call +91 99839 39306 to initiate a return.',
  },
  {
    question: 'Can I visit your store in Jaipur?',
    answer:
      'Absolutely. Our showroom is located at B-169 Anandpuri, Moti Doongri Rd, near Naila House, Jaipur, Rajasthan 302004. We are open Monday to Saturday, 10:00 AM to 8:00 PM. We welcome walk-in customers as well as appointment-based visits for wholesale or custom orders.',
  },
  {
    question: 'Do you offer wholesale pricing?',
    answer:
      'Yes. Surya Jewellers has been supplying wholesale 92.5 sterling silver jewellery to retailers, boutiques, and exporters since 2003. Wholesale enquiries can be made via our Wholesale page or by emailing suryajewellersjaipur@gmail.com with your requirements and business details.',
  },
  {
    question: 'Where exactly is your Jaipur showroom located?',
    answer:
      'Our showroom is at B-169 Anandpuri, Moti Doongri Road, near Naila House, Jaipur, Rajasthan 302004. We are conveniently located in the Anandpuri area, close to the iconic Moti Doongri Fort. You can reach us by calling +91 99839 39306 or emailing suryajewellersjaipur@gmail.com to schedule a visit.',
  },
  {
    question: 'What gemstones are used in Surya Jewellers pieces?',
    answer:
      'We use a wide range of certified natural gemstones in our 92.5 sterling silver jewellery. Our collection features natural diamonds, rubies, emeralds, sapphires, opals, moonstones, tanzanite, amethysts, garnets, and other precious and semi-precious stones. Every gemstone is ethically sourced and its type and carat weight are documented in the Certificate of Authenticity.',
  },
  {
    question: 'Do you offer custom or personalised jewellery?',
    answer:
      'Yes. We accept custom and bespoke jewellery commissions. Approximately 90% of our designs are already one-piece, one-design creations, but we are happy to craft personalised pieces to your specifications. Custom orders can be initiated by contacting us at suryajewellersjaipur@gmail.com or calling +91 99839 39306. We will discuss design, gemstone selection, and timelines.',
  },
  {
    question: 'How should I care for my sterling silver jewellery?',
    answer:
      'To maintain the lustre of your 92.5 sterling silver jewellery, store each piece individually in a soft pouch or airtight box to prevent oxidation. Clean with a soft silver-polishing cloth and avoid exposure to perfumes, chlorine, and harsh chemicals. Remove jewellery before swimming or bathing. Surya Jewellers also provides complimentary lifetime maintenance - simply bring your piece to our Jaipur showroom.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major payment methods including credit cards, debit cards, UPI, and net banking. At our Jaipur showroom we also accept cash. For online orders, payments are processed securely. Wholesale buyers may be eligible for invoice-based payment terms; please contact us for details.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Domestic orders within India are typically delivered within 5-7 business days. International orders take 10-14 business days depending on the destination country. All orders are fully insured and tracked. You will receive a tracking number as soon as your order ships. Expedited shipping options may be available on request.',
  },
];

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};
