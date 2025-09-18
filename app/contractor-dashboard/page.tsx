"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContractorPromotionBadge } from "@/components/contractor-promotion-badge"
import { Crown, TrendingUp, Eye, Phone, Star, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ContractorProfile {
  id: string
  business_name: string
  description: string
  is_featured: boolean
  spend_tier: "bronze" | "silver" | "gold" | "platinum"
  google_rating: number
  google_review_count: number
  profile_views?: number
  leads_generated?: number
}

export default function ContractorDashboard() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContractorProfile()
  }, [])

  const fetchContractorProfile = async () => {
    try {
      const supabase = createClient()
      // This would get the current user's contractor profile
      const { data, error } = await supabase.from("contractor_profiles").select("*").single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const promotionTiers = [
    {
      tier: "bronze" as const,
      name: language === "es" ? "Bronce" : "Bronze",
      price: "$49/month",
      features: [
        language === "es" ? "Perfil destacado básico" : "Basic featured profile",
        language === "es" ? "Aparece en los primeros 20 resultados" : "Appears in top 20 results",
        language === "es" ? "Badge de contratista verificado" : "Verified contractor badge",
      ],
      color: "border-amber-600 bg-amber-600/5",
    },
    {
      tier: "silver" as const,
      name: language === "es" ? "Plata" : "Silver",
      price: "$99/month",
      features: [
        language === "es" ? "Perfil destacado premium" : "Premium featured profile",
        language === "es" ? "Aparece en los primeros 10 resultados" : "Appears in top 10 results",
        language === "es" ? "Badge plateado especial" : "Special silver badge",
        language === "es" ? "Estadísticas de visualización" : "View analytics",
      ],
      color: "border-gray-400 bg-gray-400/5",
    },
    {
      tier: "gold" as const,
      name: language === "es" ? "Oro" : "Gold",
      price: "$199/month",
      features: [
        language === "es" ? "Perfil destacado dorado" : "Gold featured profile",
        language === "es" ? "Aparece en los primeros 5 resultados" : "Appears in top 5 results",
        language === "es" ? "Badge dorado premium" : "Premium gold badge",
        language === "es" ? "Estadísticas avanzadas" : "Advanced analytics",
        language === "es" ? "Soporte prioritario" : "Priority support",
      ],
      color: "border-yellow-400 bg-yellow-400/5",
    },
    {
      tier: "platinum" as const,
      name: language === "es" ? "Platino" : "Platinum",
      price: "$399/month",
      features: [
        language === "es" ? "Perfil destacado platino" : "Platinum featured profile",
        language === "es" ? "Aparece en el #1 de resultados" : "Appears #1 in results",
        language === "es" ? "Badge platino exclusivo" : "Exclusive platinum badge",
        language === "es" ? "Estadísticas completas" : "Full analytics suite",
        language === "es" ? "Soporte dedicado" : "Dedicated support",
        language === "es" ? "Promoción en redes sociales" : "Social media promotion",
      ],
      color: "border-purple-400 bg-purple-400/5",
    },
  ]

  const handleUpgrade = async (tier: string) => {
    try {
      // This would integrate with payment processing
      const response = await fetch("/api/contractor/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })

      if (response.ok) {
        // Refresh profile data
        fetchContractorProfile()
      }
    } catch (error) {
      console.error("Error upgrading:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {language === "es" ? "Panel de Contratista" : "Contractor Dashboard"}
          </h1>
          <p className="text-gray-400">
            {language === "es" ? "Gestiona tu perfil y promociones" : "Manage your profile and promotions"}
          </p>
        </div>

        {/* Current Status */}
        {profile && (
          <Card className="border-zinc-700 bg-zinc-900/50 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                {profile.business_name}
                <ContractorPromotionBadge
                  spendTier={profile.spend_tier}
                  isFeatured={profile.is_featured}
                  language={language}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    <span className="text-zinc-300">{language === "es" ? "Visualizaciones" : "Profile Views"}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{profile.profile_views || 0}</div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="text-zinc-300">{language === "es" ? "Contactos" : "Leads"}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{profile.leads_generated || 0}</div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-zinc-300">{language === "es" ? "Calificación" : "Rating"}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{profile.google_rating}/5</div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    <span className="text-zinc-300">{language === "es" ? "Nivel Actual" : "Current Tier"}</span>
                  </div>
                  <div className="text-lg font-bold text-white capitalize">{profile.spend_tier}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Promotion Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {language === "es" ? "Planes de Promoción" : "Promotion Plans"}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promotionTiers.map((plan) => (
              <Card key={plan.tier} className={`${plan.color} border-2 relative overflow-hidden`}>
                {profile?.spend_tier === plan.tier && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-semibold">
                    {language === "es" ? "Actual" : "Current"}
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <ContractorPromotionBadge spendTier={plan.tier} isFeatured={true} language={language} size="lg" />
                  </div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold text-white">{plan.price}</div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-zinc-300 text-sm flex items-start gap-2">
                        <Zap className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={profile?.spend_tier === plan.tier}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
                  >
                    {profile?.spend_tier === plan.tier
                      ? language === "es"
                        ? "Plan Actual"
                        : "Current Plan"
                      : language === "es"
                        ? "Actualizar"
                        : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <Card className="border-zinc-700 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              {language === "es" ? "Beneficios de la Promoción" : "Promotion Benefits"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {language === "es" ? "Mayor Visibilidad" : "Increased Visibility"}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {language === "es"
                    ? "Aparece en los primeros resultados de búsqueda"
                    : "Appear at the top of search results"}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{language === "es" ? "Más Contactos" : "More Leads"}</h3>
                <p className="text-zinc-400 text-sm">
                  {language === "es"
                    ? "Recibe más consultas de clientes potenciales"
                    : "Get more inquiries from potential customers"}
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {language === "es" ? "Crecimiento del Negocio" : "Business Growth"}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {language === "es" ? "Aumenta tus ingresos con más proyectos" : "Increase revenue with more projects"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer language={language} />
    </div>
  )
}
