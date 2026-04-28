import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { SocialProof } from "@/components/landing/social-proof"
import { ProblemSection } from "@/components/landing/problem"
import { AgitateSection } from "@/components/landing/agitate"
import { Features } from "@/components/landing/features"
import { HowToUse } from "@/components/landing/how-to-use"
import { TestimonialsSection } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSection />
        <AgitateSection />
        <Features />
        <HowToUse />
        <TestimonialsSection />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
