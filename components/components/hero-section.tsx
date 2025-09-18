"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Shield, Award } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n"

interface HeroSectionProps {
  language: "en" | "es"
}

export function HeroSection({ language }: HeroSectionProps) {
  const t = useTranslation(language)

  const features = [
    {
      icon: Truck,
      title: language === "es" ? "Entrega Rápida" : "Fast Delivery",
      description: language === "es" ? "Entrega el mismo día en Las Vegas" : "Same-day delivery in Las Vegas",
    },
    {
      icon: Shield,
      title: language === "es" ? "Calidad Garantizada" : "Quality Guaranteed",
      description: language === "es" ? "Productos de las mejores marcas" : "Products from top brands",
    },
    {
      icon: Award,
      title: language === "es" ? "Precios Profesionales" : "Pro Pricing",
      description: language === "es" ? "Descuentos para contratistas" : "Contractor discounts available",
    },
  ]

  return (
    <section className="relative overflow-hidden hero-gradient">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/landscape-pattern.jpg')] opacity-5"></div>

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight font-[family-name:var(--font-playfair)]">
                {language === "es" ? (
                  <>
                    Soluciones de <span className="text-primary">Paisajismo</span> Profesionales
                  </>
                ) : (
                  <>
                    Professional <span className="text-primary">Landscape</span> Solutions
                  </>
                )}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {language === "es"
                  ? "Todo lo que necesitas para crear paisajes excepcionales en el desierto de Nevada. Desde sistemas de riego hasta iluminación profesional."
                  : "Everything you need to create exceptional landscapes in the Nevada desert. From irrigation systems to professional lighting."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {language === "es" ? "Ver Productos" : "Shop Products"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/find-a-pro">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  {language === "es" ? "Encontrar un Profesional" : "Find a Pro"}
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-transparent">
              <img
                src="/modern-landscape-design-las-vegas-desert-irrigatio.jpg"
                alt={language === "es" ? "Diseño de paisaje moderno" : "Modern landscape design"}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stats */}
            <div className="absolute -bottom-6 -left-6 bg-card/80 backdrop-blur rounded-xl p-4 border border-primary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-xs text-card-foreground">
                  {language === "es" ? "Años de Experiencia" : "Years Experience"}
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-card/80 backdrop-blur rounded-xl p-4 border border-primary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5K+</div>
                <div className="text-xs text-card-foreground">
                  {language === "es" ? "Proyectos Completados" : "Projects Completed"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
