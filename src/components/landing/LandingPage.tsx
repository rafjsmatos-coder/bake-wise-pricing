import { HeroSection } from './HeroSection';
import { TargetAudienceSection } from './TargetAudienceSection';
import { PainPointsSection } from './PainPointsSection';
import { BenefitsSection } from './BenefitsSection';
import { FeaturesSection } from './FeaturesSection';
import { ExampleSection } from './ExampleSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { StickyHeader } from './StickyHeader';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader onGetStarted={onGetStarted} />
      <HeroSection onGetStarted={onGetStarted} />
      <TargetAudienceSection />
      <PainPointsSection />
      <BenefitsSection />
      <ExampleSection />
      <FeaturesSection />
      <PricingSection onGetStarted={onGetStarted} />
      <TestimonialsSection />
      <FAQSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
