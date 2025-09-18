"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { QuickLinksSection } from "@/components/quick-links-section"
import { ContractorSignupSection } from "@/components/contractor-signup-section"
import { FeaturedProductsSection } from "@/components/featured-products-section"
import { SocialMediaSection } from "@/components/social-media-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "es">("en")

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />
      <main>
        <HeroSection language={language} />
        <QuickLinksSection language={language} />
        <ContractorSignupSection language={language} />
        <FeaturedProductsSection language={language} />
        <SocialMediaSection language={language} />
      </main>
      <Footer language={language} />
    </div>
  )
}
