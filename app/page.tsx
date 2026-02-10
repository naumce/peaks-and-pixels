import { HeroSection } from '@/components/public/hero-section';
import { FeaturedTours } from '@/components/public/featured-tours';
import { ValuePropositions } from '@/components/public/value-propositions';
import { Testimonials } from '@/components/public/testimonials';
import { CTASection } from '@/components/public/cta-section';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedTours />
      <ValuePropositions />
      <Testimonials />
      <CTASection />
    </>
  );
}
