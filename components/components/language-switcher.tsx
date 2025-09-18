"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

interface LanguageSwitcherProps {
  currentLanguage: "en" | "es"
  onLanguageChange: (language: "en" | "es") => void
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onLanguageChange(currentLanguage === "en" ? "es" : "en")}
      className="flex items-center gap-2 text-foreground hover:text-foreground/80 hover:bg-amber-400/10"
    >
      <Globe className="h-4 w-4" />
      {currentLanguage === "en" ? "ES" : "EN"}
    </Button>
  )
}
