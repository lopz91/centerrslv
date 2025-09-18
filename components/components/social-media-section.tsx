"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface SocialMediaSectionProps {
  language: "en" | "es"
}

export function SocialMediaSection({ language }: SocialMediaSectionProps) {
  const t = useTranslation(language)

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/lvlandscapecenter",
      color: "hover:text-blue-500",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/lvlandscapecenter",
      color: "hover:text-pink-500",
    },
    {
      name: "TikTok",
      icon: () => (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      url: "https://tiktok.com/@lvlandscapecenter",
      color: "hover:text-black",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/@lvlandscapecenter",
      color: "hover:text-red-500",
    },
  ]

  const contactInfo = [
    {
      icon: MapPin,
      text: language === "es" ? "Serving Las Vegas, NV" : "Serving Las Vegas, NV",
      subtext: language === "es" ? "Servimos todo el área metropolitana" : "Serving the entire metro area",
    },
    {
      icon: Phone,
      text: "(702) 899-8989",
      subtext: language === "es" ? "Lun-Vie 7AM-6PM" : "Mon-Fri 7AM-6PM",
    },
    {
      icon: Mail,
      text: "Info@lvcenters.com",
      subtext: language === "es" ? "Respuesta en 24 horas" : "24-hour response",
    },
  ]

  return (
    <section className="py-16 bg-zinc-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === "es" ? "Conéctate con Nosotros" : "Connect With Us"}
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              {language === "es"
                ? "Síguenos en redes sociales para inspiración de paisajismo, consejos de expertos y las últimas ofertas"
                : "Follow us on social media for landscaping inspiration, expert tips, and the latest deals"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Social Media Links */}
            <Card className="border-zinc-700 bg-zinc-900/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {language === "es" ? "Síguenos" : "Follow Us"}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`h-16 flex-col gap-2 border-zinc-700 bg-transparent text-zinc-300 ${social.color} transition-colors`}
                        asChild
                      >
                        <a href={social.url} target="_blank" rel="noopener noreferrer">
                          {typeof IconComponent === "function" && IconComponent.name ? (
                            <IconComponent className="h-6 w-6" />
                          ) : (
                            <IconComponent />
                          )}
                          <span className="text-sm">{social.name}</span>
                        </a>
                      </Button>
                    )
                  })}
                </div>

                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">
                    {language === "es" ? "🌟 Últimas publicaciones:" : "🌟 Latest posts:"}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-zinc-300">
                      {language === "es" ? "• Nuevos diseños de patios para el verano" : "• New summer patio designs"}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {language === "es"
                        ? "• Consejos para el cuidado del césped en Nevada"
                        : "• Nevada lawn care tips"}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {language === "es" ? "• Técnicas de riego eficiente" : "• Efficient irrigation techniques"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-zinc-700 bg-zinc-900/50">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {language === "es" ? "Contáctanos" : "Contact Us"}
                </h3>
                <div className="space-y-6">
                  {contactInfo.map((contact, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <contact.icon className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{contact.text}</p>
                        <p className="text-sm text-zinc-400">{contact.subtext}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                  <h4 className="font-semibold text-amber-400 mb-2">
                    {language === "es" ? "¿Necesitas ayuda?" : "Need Help?"}
                  </h4>
                  <p className="text-sm text-zinc-300 mb-3">
                    {language === "es"
                      ? "Nuestro equipo de expertos está listo para ayudarte con tu proyecto de paisajismo."
                      : "Our expert team is ready to help you with your landscaping project."}
                  </p>
                  <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-black font-semibold">
                    {language === "es" ? "Obtener Cotización Gratis" : "Get Free Quote"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Newsletter Signup */}
          <Card className="border-zinc-700 bg-zinc-900/50 mt-8">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {language === "es" ? "Boletín de Noticias" : "Newsletter"}
                </h3>
                <p className="text-zinc-400 mb-6">
                  {language === "es"
                    ? "Recibe consejos de paisajismo y ofertas exclusivas directamente en tu correo"
                    : "Get landscaping tips and exclusive offers delivered to your inbox"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder={language === "es" ? "Tu correo electrónico" : "Your email address"}
                    className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <Button className="bg-amber-400 hover:bg-amber-300 text-black font-semibold">
                    {language === "es" ? "Suscribirse" : "Subscribe"}
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  {language === "es"
                    ? "No spam. Puedes cancelar en cualquier momento."
                    : "No spam. Unsubscribe at any time."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
