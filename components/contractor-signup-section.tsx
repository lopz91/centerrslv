"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Truck, DollarSign, Crown } from "lucide-react"
import Link from "next/link"

interface ContractorSignupSectionProps {
  language: "en" | "es"
}

export function ContractorSignupSection({ language }: ContractorSignupSectionProps) {
  const benefits = [
    {
      icon: DollarSign,
      title: language === "es" ? "Precios Especiales" : "Special Pricing",
      description: language === "es" ? "Descuentos exclusivos para contratistas" : "Exclusive contractor discounts",
    },
    {
      icon: Truck,
      title: language === "es" ? "Entrega Directa" : "Direct Delivery",
      description: language === "es" ? "Del fabricante al sitio de trabajo" : "Manufacturer to jobsite delivery",
    },
    {
      icon: Star,
      title: language === "es" ? "Perfil Verificado" : "Verified Profile",
      description: language === "es" ? "Aparece en Find a Pro" : "Featured in Find a Pro",
    },
  ]

  const discountTiers = [
    {
      name: language === "es" ? "Estándar" : "Standard",
      description:
        language === "es" ? "Descuentos básicos para nuevos contratistas" : "Basic discounts for new contractors",
      color: "bg-gray-500",
    },
    {
      name: language === "es" ? "Premier" : "Premier",
      description: language === "es" ? "Descuentos estándar para contratistas" : "Standard contractor discounts",
      color: "bg-gray-600",
    },
    {
      name: language === "es" ? "Elite" : "Elite",
      description:
        language === "es"
          ? "Descuentos premium para contratistas de alto volumen"
          : "Premium discounts for high-volume contractors",
      color: "bg-yellow-400",
    },
  ]

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {language === "es" ? "Únete como Contratista" : "Join as a Contractor"}
            </h2>
            <p className="text-gray-100 text-lg">
              {language === "es"
                ? "Obtén acceso a precios especiales y beneficios exclusivos"
                : "Get access to special pricing and exclusive benefits"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Benefits */}
            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-yellow-400" />
                  {language === "es" ? "Beneficios" : "Benefits"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{benefit.title}</h4>
                      <p className="text-gray-200 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  {language === "es" ? "Descuentos para Contratistas" : "Contractor Discounts"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {discountTiers.map((tier, index) => (
                  <div key={index} className="flex flex-col items-center p-4 rounded-lg bg-gray-800/50">
                    <Badge className={`${tier.color} text-black font-semibold text-lg px-6 py-2 mb-3`}>
                      {tier.name}
                    </Badge>
                    <p className="text-gray-200 text-sm text-center">{tier.description}</p>
                  </div>
                ))}
                <p className="text-xs text-gray-200 mt-4 text-center">
                  {language === "es"
                    ? "* Contacta con nosotros para más detalles sobre descuentos"
                    : "* Contact us for discount details"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/register">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
                {language === "es" ? "Crear Cuenta de Contratista" : "Create Contractor Account"}
              </Button>
            </Link>
            <p className="text-gray-200 text-sm mt-4">
              {language === "es" ? "¿Ya tienes cuenta? " : "Already have an account? "}
              <Link href="/auth/login" className="text-yellow-400 hover:text-yellow-300">
                {language === "es" ? "Iniciar sesión" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
