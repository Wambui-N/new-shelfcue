import { HeroSection } from '@/components/sections/HeroSection'
import { DemoSection } from '@/components/sections/DemoSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { ComparisonSection } from '@/components/sections/ComparisonSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { Footer } from '@/components/sections/Footer'
import { Navigation } from '@/components/navigation'

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
  )
}