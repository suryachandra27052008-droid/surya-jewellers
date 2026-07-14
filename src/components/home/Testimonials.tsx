'use client';

import { useEffect, useState } from 'react';

const reviews = [
  {
    text: 'Absolutely stunning pieces! The quality of the silver and gemstones is exceptional. Will definitely order again.',
    author: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
  },
  {
    text: "Ordered a custom pendant for my wife's anniversary. The craftsmanship is unmatched. Truly one of a kind!",
    author: 'Rahul M.',
    location: 'Delhi',
    rating: 5,
  },
  {
    text: 'Beautiful jewellery with excellent packaging. The certificate of authenticity gives great confidence in the purchase.',
    author: 'Anjali K.',
    location: 'Bangalore',
    rating: 5,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="py-14 sm:py-16 px-4 bg-charcoal overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            What Our Customers Say
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-3 text-white">
            Loved by Thousands
          </h2>
          <div className="w-14 h-px bg-gold mx-auto mt-4" />
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
          {reviews.map((review) => (
            <div
              key={review.author}
              className="min-w-full px-1"
            >
              <article className="bg-charcoal-light border border-white/10 rounded p-5 sm:p-6 flex flex-col gap-4 min-h-[220px]">
                <div className="flex justify-center gap-1" aria-label={`${review.rating} star review`}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} style={{ color: '#D4AF37' }} className="text-base">
                      *
                    </span>
                  ))}
                </div>

                <p className="text-white/75 text-sm leading-relaxed flex-1 italic text-center">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-sm font-semibold">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{review.author}</p>
                    <p className="text-white/40 text-xs">{review.location}</p>
                  </div>
                </div>
              </article>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center gap-2" aria-label="Review carousel navigation">
          {reviews.map((review, index) => (
            <button
              key={review.author}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show review ${index + 1}`}
              aria-pressed={activeIndex === index}
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? 'w-7 bg-gold' : 'w-1.5 bg-white/40'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
