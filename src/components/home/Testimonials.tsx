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
  return (
    <section className="py-24 px-4 bg-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-gold text-xs tracking-[0.4em] uppercase">
            What Our Customers Say
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mt-4 text-white">
            Loved by Thousands
          </h2>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.author}
              className="bg-charcoal-light border border-white/10 hover:border-gold/40 rounded p-8 flex flex-col gap-6 h-full transition-colors duration-300 group"
            >
              <div className="flex gap-1" aria-label={`${review.rating} star review`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} style={{ color: '#D4AF37' }} className="text-lg">
                    *
                  </span>
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed flex-1 italic">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif text-sm font-semibold">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{review.author}</p>
                  <p className="text-white/40 text-xs">{review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
