import Hero from '@/components/home/Hero';
import FeaturedCollections from '@/components/home/FeaturedCollections';
import Testimonials from '@/components/home/Testimonials';
import TrustSection from '@/components/home/TrustSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <Testimonials />
      <TrustSection />
    </>
  );
}
