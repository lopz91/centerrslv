"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, MapPin, Filter, X } from "lucide-react"
import type { Category } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"

interface ProductFiltersProps {
  categories: Category[]
  language: "en" | "es"
  onFiltersChange: (filters: {
    search?: string
    categoryId?: string
    zipCode?: string
    sortBy?: string
  }) => void
  initialFilters?: {
    search?: string
    categoryId?: string
    zipCode?: string
    sortBy?: string
  }
}

export function ProductFilters({ categories, language, onFiltersChange, initialFilters }: ProductFiltersProps) {
  const [search, setSearch] = useState(initialFilters?.search || "")
  const [categoryId, setCategoryId] = useState(initialFilters?.categoryId || "all")
  const [zipCode, setZipCode] = useState(initialFilters?.zipCode || "")
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || "newest")
  const [showFilters, setShowFilters] = useState(false)

  const t = useTranslation(language)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    onFiltersChange({
      search: search || undefined,
      categoryId: categoryId !== "all" ? categoryId : undefined,
      zipCode: zipCode || undefined,
      sortBy: sortBy || undefined,
    })
  }

  const clearFilters = () => {
    setSearch("")
    setCategoryId("all")
    setZipCode("")
    setSortBy("newest")
    onFiltersChange({})
  }

  const hasActiveFilters = search || categoryId !== "all" || zipCode || sortBy !== "newest"

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          type="text"
          placeholder={language === "es" ? "Buscar productos..." : "Search products..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400 focus:border-amber-400"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-400 hover:bg-amber-300 text-black"
        >
          {t.search}
        </Button>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400"
        >
          <Filter className="h-4 w-4 mr-2" />
          {language === "es" ? "Filtros" : "Filters"}
          {hasActiveFilters && (
            <span className="ml-2 bg-amber-400 text-black rounded-full w-5 h-5 text-xs flex items-center justify-center">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-zinc-400 hover:text-amber-400">
            <X className="h-4 w-4 mr-2" />
            {language === "es" ? "Limpiar" : "Clear"}
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {language === "es" ? "Filtrar Productos" : "Filter Products"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Categoría" : "Category"}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder={language === "es" ? "Todas las categorías" : "All categories"} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">{language === "es" ? "Todas las categorías" : "All categories"}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {language === "es" ? category.name_es : category.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Zip Code Filter */}
              <div className="space-y-2">
                <Label className="text-zinc-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {language === "es" ? "Código Postal" : "Zip Code"}
                </Label>
                <Input
                  type="text"
                  placeholder={language === "es" ? "Ej: 89101" : "e.g. 89101"}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                  maxLength={5}
                />
                <p className="text-xs text-zinc-500">
                  {language === "es"
                    ? "Algunos productos tienen restricciones por ubicación"
                    : "Some products have location restrictions"}
                </p>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <Label className="text-zinc-300">{language === "es" ? "Ordenar por" : "Sort by"}</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="newest">{language === "es" ? "Más recientes" : "Newest"}</SelectItem>
                    <SelectItem value="price-low">
                      {language === "es" ? "Precio: Menor a mayor" : "Price: Low to High"}
                    </SelectItem>
                    <SelectItem value="price-high">
                      {language === "es" ? "Precio: Mayor a menor" : "Price: High to Low"}
                    </SelectItem>
                    <SelectItem value="name">{language === "es" ? "Nombre A-Z" : "Name A-Z"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={applyFilters} className="bg-amber-400 hover:bg-amber-300 text-black">
                {language === "es" ? "Aplicar Filtros" : "Apply Filters"}
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 bg-transparent"
              >
                {language === "es" ? "Limpiar Todo" : "Clear All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
