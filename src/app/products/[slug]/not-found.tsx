import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="pt-8 pb-16 text-center">
      <h1 className="font-serif text-3xl text-charcoal mb-4">Product Not Found</h1>
      <p className="text-charcoal-muted mb-8">The piece you are looking for does not exist.</p>
      <Link href="/products" className="btn-gold inline-block">Back to Collections</Link>
    </div>
  );
}
