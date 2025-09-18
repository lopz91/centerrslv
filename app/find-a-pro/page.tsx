"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContractorCard } from "@/components/contractor-card"
import { ContractorFilters } from "@/components/contractor-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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
  spend_tier: string
  website_url?: string
  facebook_url?: string
  instagram_url?: string
}

export default function FindAProPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [contractors, setContractors] = useState<ContractorProfile[]>([])
  const [filteredContractors, setFilteredContractors] = useState<ContractorProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContractors()
  }, [])

  useEffect(() => {
    filterContractors()
  }, [contractors, searchTerm, selectedSpecialties, selectedAreas])

  const fetchContractors = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("contractor_profiles")
        .select("*")
        .eq("is_verified", true)
        .order("is_featured", { ascending: false })
        .order("google_rating", { ascending: false })

      if (error) throw error
      setContractors(data || [])
    } catch (error) {
      console.error("Error fetching contractors:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterContractors = () => {
    let filtered = contractors

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contractor) =>
          contractor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter((contractor) =>
        selectedSpecialties.some((specialty) => contractor.specialties.includes(specialty)),
      )
    }

    // Service area filter
    if (selectedAreas.length > 0) {
      filtered = filtered.filter((contractor) => selectedAreas.some((area) => contractor.service_areas.includes(area)))
    }

    setFilteredContractors(filtered)
  }

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {language === "es" ? "Encuentra un Profesional" : "Find a Pro"}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {language === "es"
              ? "Conecta con contratistas verificados especializados en paisajismo en Las Vegas"
              : "Connect with verified landscaping contractors in Las Vegas"}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={language === "es" ? "Buscar contratistas..." : "Search contractors..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{contractors.length}</div>
              <div className="text-sm text-gray-300">{language === "es" ? "Contratistas" : "Contractors"}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {contractors.filter((c) => c.is_verified).length}
              </div>
              <div className="text-sm text-gray-300">{language === "es" ? "Verificados" : "Verified"}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {contractors.filter((c) => c.is_featured).length}
              </div>
              <div className="text-sm text-gray-300">{language === "es" ? "Destacados" : "Featured"}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">4.8</div>
              <div className="text-sm text-gray-300">{language === "es" ? "Calificación Promedio" : "Avg Rating"}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ContractorFilters
              language={language}
              contractors={contractors}
              selectedSpecialties={selectedSpecialties}
              selectedAreas={selectedAreas}
              onSpecialtiesChange={setSelectedSpecialties}
              onAreasChange={setSelectedAreas}
            />
          </div>

          {/* Contractors Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-900/50 rounded-lg p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-800 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-800 rounded"></div>
                      <div className="h-6 w-20 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContractors.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredContractors.map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} language={language} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {language === "es" ? "No se encontraron contratistas" : "No contractors found"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {language === "es" ? "Intenta ajustar tus filtros de búsqueda" : "Try adjusting your search filters"}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedSpecialties([])
                    setSelectedAreas([])
                  }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black"
                >
                  {language === "es" ? "Limpiar Filtros" : "Clear Filters"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action for Contractors */}
        <div className="mt-16 bg-gradient-to-r from-yellow-400/10 to-gray-600/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {language === "es" ? "¿Eres un Contratista?" : "Are You a Contractor?"}
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            {language === "es"
              ? "Únete a nuestra plataforma y conecta con clientes que buscan servicios de paisajismo profesionales"
              : "Join our platform and connect with customers looking for professional landscaping services"}
          </p>
          <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold">
            {language === "es" ? "Crear Perfil de Contratista" : "Create Contractor Profile"}
          </Button>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
