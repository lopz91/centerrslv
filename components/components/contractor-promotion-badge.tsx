"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, Star, Zap, Trophy } from "lucide-react"

interface ContractorPromotionBadgeProps {
  spendTier: "bronze" | "silver" | "gold" | "platinum"
  isFeatured: boolean
  language: "en" | "es"
  size?: "sm" | "md" | "lg"
}

export function ContractorPromotionBadge({
  spendTier,
  isFeatured,
  language,
  size = "md",
}: ContractorPromotionBadgeProps) {
  if (!isFeatured) return null

  const tierConfig = {
    bronze: {
      icon: Star,
      color: "bg-amber-600 text-white",
      label: language === "es" ? "Bronce" : "Bronze",
      glow: "shadow-amber-500/20",
    },
    silver: {
      icon: Zap,
      color: "bg-gray-400 text-black",
      label: language === "es" ? "Plata" : "Silver",
      glow: "shadow-gray-400/20",
    },
    gold: {
      icon: Crown,
      color: "bg-yellow-400 text-black",
      label: language === "es" ? "Oro" : "Gold",
      glow: "shadow-yellow-400/30",
    },
    platinum: {
      icon: Trophy,
      color: "bg-gradient-to-r from-purple-400 to-pink-400 text-white",
      label: language === "es" ? "Platino" : "Platinum",
      glow: "shadow-purple-400/40",
    },
  }

  const config = tierConfig[spendTier]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge
      className={`
        ${config.color} 
        ${config.glow} 
        ${sizeClasses[size]}
        shadow-lg border-0 font-semibold flex items-center gap-1
        animate-pulse
      `}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </Badge>
  )
}
