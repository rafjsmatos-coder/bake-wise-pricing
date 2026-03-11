import { HeroSection } from './HeroSection';
import { TargetAudienceSection } from './TargetAudienceSection';
import { PainPointsSection } from './PainPointsSection';
import { BeforeAfterSection } from './BeforeAfterSection';
import { BenefitsSection } from './BenefitsSection';
import { ExampleSection } from './ExampleSection';
import { ComparisonSection } from './ComparisonSection';
import { ScreenshotsSection } from './ScreenshotsSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { StickyHeader } from './StickyHeader';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader onGetStarted={onGetStarted} onLogin={onLogin} />
      <HeroSection onGetStarted={onGetStarted} onLogin={onLogin} />
      <TargetAudienceSection />
      <PainPointsSection />
      <BeforeAfterSection />
      <BenefitsSection />
      <ExampleSection />
      <ComparisonSection />
      <ScreenshotsSection />
      <FeaturesSection />
      <PricingSection onGetStarted={onGetStarted} />
      <TestimonialsSection />
      <FAQSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
