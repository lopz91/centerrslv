"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Tag, Clock } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface PromotionalCampaign {
  id: string
  name_en: string
  name_es: string
  description_en: string
  description_es: string
  campaign_type: string
  discount_percentage: number
  end_date: string
  banner_image_url?: string
}

interface PromotionalBannerProps {
  language: "en" | "es"
  userType?: "retail" | "contractor" | "wholesale"
}

export function PromotionalBanner({ language, userType = "retail" }: PromotionalBannerProps) {
  const [campaigns, setCampaigns] = useState<PromotionalCampaign[]>([])
  const [dismissedCampaigns, setDismissedCampaigns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslation(language)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`/api/campaigns?userType=${userType}`)
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data.campaigns || [])
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()

    // Load dismissed campaigns from localStorage
    const dismissed = localStorage.getItem("dismissedCampaigns")
    if (dismissed) {
      setDismissedCampaigns(JSON.parse(dismissed))
    }
  }, [userType])

  const handleDismiss = (campaignId: string) => {
    const newDismissed = [...dismissedCampaigns, campaignId]
    setDismissedCampaigns(newDismissed)
    localStorage.setItem("dismissedCampaigns", JSON.stringify(newDismissed))
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return language === "es" ? `${days} días restantes` : `${days} days left`
    } else {
      return language === "es" ? `${hours} horas restantes` : `${hours} hours left`
    }
  }

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case "flash_sale":
        return "bg-red-600"
      case "seasonal":
        return "bg-green-600"
      case "new_customer":
        return "bg-blue-600"
      case "clearance":
        return "bg-orange-600"
      default:
        return "bg-amber-600"
    }
  }

  const activeCampaigns = campaigns.filter((campaign) => !dismissedCampaigns.includes(campaign.id))

  if (isLoading || activeCampaigns.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {activeCampaigns.map((campaign) => {
        const timeRemaining = getTimeRemaining(campaign.end_date)
        if (!timeRemaining) return null

        return (
          <Card key={campaign.id} className="border-amber-400/20 bg-gradient-to-r from-amber-900/20 to-amber-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-amber-400" />
                    <Badge className={`${getCampaignTypeColor(campaign.campaign_type)} text-white`}>
                      {campaign.campaign_type === "flash_sale" && (language === "es" ? "FLASH" : "FLASH")}
                      {campaign.campaign_type === "seasonal" && (language === "es" ? "TEMPORADA" : "SEASONAL")}
                      {campaign.campaign_type === "new_customer" && (language === "es" ? "NUEVO" : "NEW")}
                      {campaign.campaign_type === "clearance" && (language === "es" ? "LIQUIDACIÓN" : "CLEARANCE")}
                      {campaign.campaign_type === "loyalty" && (language === "es" ? "LEALTAD" : "LOYALTY")}
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">
                      {language === "es" ? campaign.name_es : campaign.name_en}
                    </h3>
                    <p className="text-zinc-300 text-sm">
                      {language === "es" ? campaign.description_es : campaign.description_en}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">{campaign.discount_percentage}% OFF</div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {timeRemaining}
                    </div>
                  </div>

                  <Button size="sm" className="bg-amber-400 hover:bg-amber-300 text-black font-semibold">
                    {language === "es" ? "Comprar Ahora" : "Shop Now"}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(campaign.id)}
                  className="text-zinc-400 hover:text-white ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
