"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Mail, ExternalLink } from "lucide-react"
import { ContractorPromotionBadge } from "./contractor-promotion-badge"

interface ContractorProfile {
  id: string
  business_name: string
  description: string
  specialties: string[]
  profile_image_url?: string
  google_rating: number
  google_review_count: number
  service_areas: string[]
  years_in_business?: number
  is_verified: boolean
  is_featured: boolean
  spend_tier: "bronze" | "silver" | "gold" | "platinum"
  website_url?: string
  facebook_url?: string
  instagram_url?: string
}

interface ContractorCardProps {
  contractor: ContractorProfile
  language: "en" | "es"
}

export function ContractorCard({ contractor, language }: ContractorCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? "text-amber-400 fill-current" : "text-zinc-400"}`} />
    ))
  }

  return (
    <Card
      className={`
      border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all duration-300
      ${contractor.is_featured ? "ring-2 ring-yellow-400/30 shadow-lg shadow-yellow-400/10" : ""}
    `}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center">
              <span className="text-amber-400 font-semibold text-lg">{contractor.business_name.charAt(0)}</span>
            </div>
            <div>
              <CardTitle className="text-white text-lg">{contractor.business_name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {contractor.is_verified && (
                  <Badge className="bg-green-600 text-white text-xs">
                    {language === "es" ? "Verificado" : "Verified"}
                  </Badge>
                )}
                <ContractorPromotionBadge
                  spendTier={contractor.spend_tier}
                  isFeatured={contractor.is_featured}
                  language={language}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {contractor.is_featured && (
        <div className="px-6 pb-2">
          <div className="bg-gradient-to-r from-yellow-400/10 to-amber-400/10 rounded-lg p-3 border border-yellow-400/20">
            <p className="text-yellow-400 text-sm font-medium">
              {language === "es" ? "⭐ Contratista Destacado - Promocionado" : "⭐ Featured Contractor - Promoted"}
            </p>
          </div>
        </div>
      )}

      <CardContent className="space-y-4">
        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">{renderStars(contractor.google_rating)}</div>
          <span className="text-white font-medium">{contractor.google_rating}</span>
          <span className="text-zinc-400 text-sm">
            ({contractor.google_review_count} {language === "es" ? "reseñas" : "reviews"})
          </span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2">
          {contractor.specialties.slice(0, 3).map((specialty, index) => (
            <Badge key={index} variant="secondary" className="bg-zinc-800 text-zinc-300">
              {specialty}
            </Badge>
          ))}
          {contractor.specialties.length > 3 && (
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              +{contractor.specialties.length - 3} {language === "es" ? "más" : "more"}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-sm line-clamp-3">{contractor.description}</p>

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MapPin className="h-4 w-4" />
            <span>{contractor.service_areas.join(", ")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Phone className="h-4 w-4" />
            <span>{contractor.business_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Mail className="h-4 w-4" />
            <span>{contractor.business_name}</span>
          </div>
        </div>

        {/* Experience */}
        <div className="text-sm text-zinc-400">
          {contractor.years_in_business} {language === "es" ? "años en el negocio" : "years in business"}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => window.open(contractor.website_url, "_blank")}
            className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-semibold"
          >
            {language === "es" ? "Visitar Sitio Web" : "Visit Website"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-300 hover:border-amber-400 bg-transparent"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
