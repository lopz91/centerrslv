"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react"

interface FooterProps {
  language: "en" | "es"
}

export function Footer({ language }: FooterProps) {
  const t = useTranslation(language)

  const quickLinks = [
    { name: t.home, href: "/" },
    { name: t.products, href: "/products" },
    { name: t.categories, href: "/categories" },
    { name: t.about, href: "/about" },
    { name: t.contact, href: "/contact" },
  ]

  const categories = [
    { name: language === "es" ? "Riego" : "Irrigation", href: "/products/irrigation" },
    { name: language === "es" ? "Iluminación" : "Lighting", href: "/products/landscape-lighting" },
    { name: language === "es" ? "Materiales Duros" : "Hardscape", href: "/products/hardscape-materials" },
    { name: language === "es" ? "Materiales a Granel" : "Bulk Materials", href: "/products/bulk-materials" },
    { name: language === "es" ? "Herramientas" : "Tools", href: "/products/tools-equipment" },
  ]

  return (
    <footer className="bg-black border-t border-zinc-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-sm">
                <span className="text-black font-bold text-sm">LV</span>
              </div>
              <div>
                <h3 className="font-bold text-white">{t.companyName}</h3>
                <p className="text-xs text-amber-400">{t.companyTagline}</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {language === "es"
                ? "Su socio confiable para suministros de paisajismo profesional en Las Vegas y áreas circundantes."
                : "Your trusted partner for professional landscaping supplies in Las Vegas and surrounding areas."}
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com/lvlandscapecenter"
                className="text-zinc-300 hover:text-amber-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://instagram.com/lvlandscapecenter"
                className="text-zinc-300 hover:text-amber-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://linkedin.com/company/lvlandscapecenter"
                className="text-zinc-300 hover:text-amber-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">{language === "es" ? "Enlaces Rápidos" : "Quick Links"}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-zinc-300 hover:text-amber-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">{language === "es" ? "Categorías" : "Categories"}</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link href={category.href} className="text-sm text-zinc-300 hover:text-amber-400 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">{language === "es" ? "Contacto" : "Contact"}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-zinc-200">
                  <p>Serving Las Vegas, NV</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-zinc-200">(702) 899-8989</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-zinc-200">Info@lvcenters.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-zinc-200">
                  <p>{language === "es" ? "Lun - Vie: 7:00 AM - 6:00 PM" : "Mon - Fri: 7:00 AM - 6:00 PM"}</p>
                  <p>{language === "es" ? "Sáb: 8:00 AM - 4:00 PM" : "Sat: 8:00 AM - 4:00 PM"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-zinc-300">
              © 2024 {t.companyName}. {language === "es" ? "Todos los derechos reservados." : "All rights reserved."}
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-zinc-300 hover:text-amber-400 transition-colors">
                {language === "es" ? "Privacidad" : "Privacy Policy"}
              </Link>
              <Link href="/terms" className="text-sm text-zinc-300 hover:text-amber-400 transition-colors">
                {language === "es" ? "Términos" : "Terms of Service"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
