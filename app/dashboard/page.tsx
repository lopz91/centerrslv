"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "@/lib/i18n"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"
import { toast } from "sonner"
import { User, Mail, Building, MapPin } from "lucide-react"

export default function DashboardPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const t = useTranslation(language)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuthAndLoadProfile()
  }, [])

  const checkAuthAndLoadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login?redirect=/dashboard")
        return
      }

      setIsLoggedIn(true)

      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Error loading profile:", error)
      } else {
        setProfile(profileData)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      router.push("/auth/login?redirect=/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)

    try {
      const { error } = await supabase.from("profiles").update(profile).eq("id", profile.id)

      if (error) throw error

      toast.success(language === "es" ? "Perfil actualizado" : "Profile updated")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(language === "es" ? "Error al actualizar perfil" : "Error updating profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={isLoggedIn} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <p className="text-zinc-400">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer language={language} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={isLoggedIn} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">{t.dashboard}</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardNav language={language} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card */}
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-400" />
                  {language === "es" ? "Bienvenido" : "Welcome"}
                  {profile?.first_name && `, ${profile.first_name}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Email</p>
                      <p className="text-white font-medium">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">{language === "es" ? "Tipo de Cuenta" : "Account Type"}</p>
                      <p className="text-white font-medium capitalize">{profile?.account_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">{language === "es" ? "Ubicación" : "Location"}</p>
                      <p className="text-white font-medium">
                        {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  {language === "es" ? "Información del Perfil" : "Profile Information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">{language === "es" ? "Nombre" : "First Name"}</Label>
                      <Input
                        value={profile?.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">{language === "es" ? "Apellido" : "Last Name"}</Label>
                      <Input
                        value={profile?.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">{language === "es" ? "Empresa" : "Company"}</Label>
                    <Input
                      value={profile?.company_name || ""}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">{language === "es" ? "Teléfono" : "Phone"}</Label>
                    <Input
                      value={profile?.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">{language === "es" ? "Dirección" : "Address"}</Label>
                    <Input
                      value={profile?.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">{language === "es" ? "Ciudad" : "City"}</Label>
                      <Input
                        value={profile?.city || ""}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">{language === "es" ? "Estado" : "State"}</Label>
                      <Select value={profile?.state || ""} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="NV">Nevada</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="AZ">Arizona</SelectItem>
                          <SelectItem value="UT">Utah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">{language === "es" ? "Código Postal" : "Zip Code"}</Label>
                      <Input
                        value={profile?.zip_code || ""}
                        onChange={(e) => handleInputChange("zip_code", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-semibold"
                  >
                    {isSaving ? t.loading : t.save}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
