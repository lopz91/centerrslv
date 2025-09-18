"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface FilterOptions {
  location: string
  specialties: string[]
  minRating: number
  maxDistance: number
  verified: boolean
  minExperience: number
}

interface ContractorFiltersProps {
  language: "en" | "es"
  onFiltersChange: (filters: FilterOptions) => void
  onSearch: (query: string) => void
}

export function ContractorFilters({ language, onFiltersChange, onSearch }: ContractorFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    location: "",
    specialties: [],
    minRating: 0,
    maxDistance: 50,
    verified: false,
    minExperience: 0,
  })

  const specialtyOptions = [
    { value: "landscaping", label: language === "es" ? "Paisajismo" : "Landscaping" },
    { value: "hardscaping", label: language === "es" ? "Construcción Dura" : "Hardscaping" },
    { value: "irrigation", label: language === "es" ? "Irrigación" : "Irrigation" },
    { value: "tree-service", label: language === "es" ? "Servicio de Árboles" : "Tree Service" },
    { value: "lawn-care", label: language === "es" ? "Cuidado del Césped" : "Lawn Care" },
    { value: "pool-landscaping", label: language === "es" ? "Paisajismo de Piscinas" : "Pool Landscaping" },
    { value: "commercial", label: language === "es" ? "Comercial" : "Commercial" },
    { value: "residential", label: language === "es" ? "Residencial" : "Residential" },
  ]

  const locationOptions = [
    { value: "las-vegas", label: "Las Vegas" },
    { value: "henderson", label: "Henderson" },
    { value: "north-las-vegas", label: "North Las Vegas" },
    { value: "summerlin", label: "Summerlin" },
    { value: "green-valley", label: "Green Valley" },
    { value: "boulder-city", label: "Boulder City" },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSpecialtyToggle = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter((s) => s !== specialty)
      : [...filters.specialties, specialty]

    handleFilterChange("specialties", newSpecialties)
  }

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      location: "",
      specialties: [],
      minRating: 0,
      maxDistance: 50,
      verified: false,
      minExperience: 0,
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
    setSearchQuery("")
    onSearch("")
  }

  const activeFiltersCount = Object.values(filters).filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === "boolean") return value
    if (typeof value === "number") return value > 0
    if (typeof value === "string") return value !== ""
    return false
  }).length

  return (
    <Card className="border-zinc-700 bg-zinc-900/50 sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {language === "es" ? "Filtros" : "Filters"}
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount}</Badge>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <Label className="text-zinc-300">{language === "es" ? "Buscar Contratistas" : "Search Contractors"}</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={language === "es" ? "Nombre o empresa..." : "Name or company..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Button type="submit" size="sm" className="bg-amber-400 hover:bg-amber-300 text-black">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-zinc-300">{language === "es" ? "Ubicación" : "Location"}</Label>
          <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder={language === "es" ? "Seleccionar área" : "Select area"} />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Specialties */}
        <div className="space-y-3">
          <Label className="text-zinc-300">{language === "es" ? "Especialidades" : "Specialties"}</Label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {specialtyOptions.map((specialty) => (
              <div key={specialty.value} className="flex items-center space-x-2">
                <Checkbox
                  id={specialty.value}
                  checked={filters.specialties.includes(specialty.value)}
                  onCheckedChange={() => handleSpecialtyToggle(specialty.value)}
                />
                <Label htmlFor={specialty.value} className="text-sm text-zinc-300 cursor-pointer">
                  {specialty.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-zinc-300">{language === "es" ? "Calificación Mínima" : "Minimum Rating"}</Label>
          <div className="px-2">
            <Slider
              value={[filters.minRating]}
              onValueChange={(value) => handleFilterChange("minRating", value[0])}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>0</span>
              <span className="text-amber-400">{filters.minRating}+ ⭐</span>
              <span>5</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-3">
          <Label className="text-zinc-300">{language === "es" ? "Distancia Máxima" : "Maximum Distance"}</Label>
          <div className="px-2">
            <Slider
              value={[filters.maxDistance]}
              onValueChange={(value) => handleFilterChange("maxDistance", value[0])}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>5 mi</span>
              <span className="text-amber-400">{filters.maxDistance} mi</span>
              <span>100 mi</span>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-3">
          <Label className="text-zinc-300">{language === "es" ? "Experiencia Mínima" : "Minimum Experience"}</Label>
          <div className="px-2">
            <Slider
              value={[filters.minExperience]}
              onValueChange={(value) => handleFilterChange("minExperience", value[0])}
              max={30}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>0</span>
              <span className="text-amber-400">
                {filters.minExperience}+ {language === "es" ? "años" : "years"}
              </span>
              <span>30</span>
            </div>
          </div>
        </div>

        {/* Verified Only */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="verified"
            checked={filters.verified}
            onCheckedChange={(checked) => handleFilterChange("verified", checked)}
          />
          <Label htmlFor="verified" className="text-sm text-zinc-300 cursor-pointer">
            {language === "es" ? "Solo contratistas verificados" : "Verified contractors only"}
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
