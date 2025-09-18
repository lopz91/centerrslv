"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, Search, ShoppingCart, Users, Percent, Wrench } from "lucide-react"
import Link from "next/link"

interface QuickLinksSectionProps {
  language: "en" | "es"
}

export function QuickLinksSection({ language }: QuickLinksSectionProps) {
  const quickLinks = [
    {
      icon: Calculator,
      title: language === "es" ? "Calculadoras" : "Calculators",
      description: language === "es" ? "Herramientas de cálculo" : "Calculation Tools",
      href: "/tools",
      color: "from-yellow-400/20 to-yellow-600/20",
    },
    {
      icon: Users,
      title: language === "es" ? "Encuentra un Pro" : "Find a Pro",
      description: language === "es" ? "Contratistas verificados" : "Verified Contractors",
      href: "/find-a-pro",
      color: "from-gray-400/20 to-gray-600/20",
    },
    {
      icon: ShoppingCart,
      title: language === "es" ? "Productos" : "Products",
      description: language === "es" ? "Catálogo completo" : "Full Catalog",
      href: "/products",
      color: "from-yellow-400/20 to-yellow-600/20",
    },
    {
      icon: Percent,
      title: language === "es" ? "Ofertas" : "Sales",
      description: language === "es" ? "Descuentos especiales" : "Special Discounts",
      href: "/sales",
      color: "from-red-400/20 to-red-600/20",
    },
    {
      icon: Search,
      title: language === "es" ? "Categorías" : "Categories",
      description: language === "es" ? "Explorar por tipo" : "Browse by Type",
      href: "/categories",
      color: "from-gray-400/20 to-gray-600/20",
    },
    {
      icon: Wrench,
      title: language === "es" ? "Herramientas" : "Tools",
      description: language === "es" ? "Calculadoras y más" : "Calculators & More",
      href: "/tools",
      color: "from-yellow-400/20 to-yellow-600/20",
    },
  ]

  return (
    <section className="py-16 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === "es" ? "Enlaces Rápidos" : "Quick Links"}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            {language === "es"
              ? "Accede rápidamente a nuestras herramientas y servicios más populares"
              : "Quickly access our most popular tools and services"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <Card className="border-gray-800 bg-gray-900/50 hover:bg-gray-800/50 transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <link.icon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2">{link.title}</h3>
                  <p className="text-xs text-gray-400">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
