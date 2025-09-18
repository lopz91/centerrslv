"use client"

import { useState } from "react"
import { Calculator, Ruler, Weight, TrendingUp, User } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SquareFootageCalculator } from "@/components/calculators/square-footage-calculator"
import { TonnageCalculator } from "@/components/calculators/tonnage-calculator"
import { PatternCalculator } from "@/components/calculators/pattern-calculator"
import { SalesCalculator } from "@/components/calculators/sales-calculator"
import { CustomerSubmissionWidget } from "@/components/customer-submission-widget"
import { useTranslation } from "@/lib/i18n"

export default function ToolsPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const t = useTranslation(language)

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />

      {/* Hero Section */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              {language === "es" ? "Herramientas Profesionales de" : "Professional"}{" "}
              <span className="text-primary">{language === "es" ? "Paisajismo" : "Landscape Tools"}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              {language === "es"
                ? "Calculadoras precisas y herramientas para ayudarte a planificar y estimar tus proyectos de paisajismo con precisión."
                : "Accurate calculators and tools to help you plan and estimate your landscaping projects with precision."}
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:gap-12">
            {/* Square Footage Calculator */}
            <div className="bg-card rounded-lg border p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Ruler className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t.squareFootageCalculator}</h2>
                  <p className="text-muted-foreground">
                    {language === "es"
                      ? "Calcula el área para diferentes formas y espacios"
                      : "Calculate area for different shapes and spaces"}
                  </p>
                </div>
              </div>
              <SquareFootageCalculator language={language} />
            </div>

            {/* Tonnage Calculator */}
            <div className="bg-card rounded-lg border p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Weight className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t.tonnageCalculator}</h2>
                  <p className="text-muted-foreground">
                    {language === "es"
                      ? "Calcula los requisitos de peso y volumen del material"
                      : "Calculate material weight and volume requirements"}
                  </p>
                </div>
              </div>
              <TonnageCalculator language={language} />
            </div>

            {/* Pattern Calculator */}
            <div className="bg-card rounded-lg border p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t.patternCalculator}</h2>
                  <p className="text-muted-foreground">
                    {language === "es"
                      ? "Calcula los materiales necesarios para patrones y diseños de pavimentación"
                      : "Calculate materials needed for paving patterns and layouts"}
                  </p>
                </div>
              </div>
              <PatternCalculator language={language} />
            </div>

            {/* Estimator Tool */}
            <div className="bg-card rounded-lg border p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t.estimatorTool}</h2>
                  <p className="text-muted-foreground">
                    {language === "es"
                      ? "Genera estimaciones y precios de proyectos (Solo cuentas de contratista)"
                      : "Generate project estimates and pricing (Contractor accounts only)"}
                  </p>
                </div>
              </div>
              <SalesCalculator language={language} />
            </div>

            {/* Customer Submission Widget */}
            <div className="bg-card rounded-lg border p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {language === "es" ? "Solicitar Servicios" : "Request Services"}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === "es"
                      ? "Conéctate con profesionales de paisajismo para tu proyecto"
                      : "Connect with landscaping professionals for your project"}
                  </p>
                </div>
              </div>
              <CustomerSubmissionWidget language={language} />
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              {language === "es" ? "¿Necesitas Ayuda con tus Cálculos?" : "Need Help with Your Calculations?"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {language === "es"
                ? "Nuestro equipo de profesionales de paisajismo está aquí para ayudarte a obtener las estimaciones más precisas para tu proyecto."
                : "Our team of landscaping professionals is here to help you get the most accurate estimates for your project."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                {language === "es" ? "Contactar Nuestros Expertos" : "Contact Our Experts"}
              </a>
              <a
                href="/quote"
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                {language === "es" ? "Obtener una Cotización" : "Get a Quote"}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer language={language} />
    </div>
  )
}
