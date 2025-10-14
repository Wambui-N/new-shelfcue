import { Navigation } from "@/components/navigation";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { DemoSection } from "@/components/sections/DemoSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { Footer } from "@/components/sections/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { PricingSection } from "@/components/sections/PricingSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}
