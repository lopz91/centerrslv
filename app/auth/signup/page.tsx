"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { toast } from "sonner"

export default function SignUpPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
    phone: "",
    accountType: "retail" as "retail" | "contractor" | "wholesale",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const t = useTranslation(language)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError(language === "es" ? "Las contraseñas no coinciden" : "Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_name: formData.companyName,
            phone: formData.phone,
            account_type: formData.accountType,
          },
        },
      })
      if (error) throw error

      // Create customer profile after successful signup
      if (data.user) {
        try {
          await fetch("/api/customers/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: data.user.id,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              company_name: formData.companyName,
              account_type: formData.accountType,
            }),
          })
        } catch (profileError) {
          console.error("Error creating customer profile:", profileError)
          // Don't fail the signup if profile creation fails
        }
      }

      toast.success(language === "es" ? "Cuenta creada exitosamente" : "Account created successfully")
      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />

      <main className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{t.signup}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {language === "es" ? "Crea una nueva cuenta" : "Create a new account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName" className="text-zinc-300">
                          {language === "es" ? "Nombre" : "First Name"}
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName" className="text-zinc-300">
                          {language === "es" ? "Apellido" : "Last Name"}
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-zinc-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="companyName" className="text-zinc-300">
                        {language === "es" ? "Empresa (Opcional)" : "Company (Optional)"}
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-zinc-300">
                        {language === "es" ? "Teléfono" : "Phone"}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="accountType" className="text-zinc-300">
                        {language === "es" ? "Tipo de Cuenta" : "Account Type"}
                      </Label>
                      <Select
                        value={formData.accountType}
                        onValueChange={(value) => handleInputChange("accountType", value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="retail">
                            {language === "es" ? "Cliente Minorista" : "Retail Customer"}
                          </SelectItem>
                          <SelectItem value="contractor">{language === "es" ? "Contratista" : "Contractor"}</SelectItem>
                          <SelectItem value="wholesale">{language === "es" ? "Mayorista" : "Wholesale"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-zinc-300">
                        {language === "es" ? "Contraseña" : "Password"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="repeatPassword" className="text-zinc-300">
                        {language === "es" ? "Repetir Contraseña" : "Repeat Password"}
                      </Label>
                      <Input
                        id="repeatPassword"
                        type="password"
                        required
                        value={formData.repeatPassword}
                        onChange={(e) => handleInputChange("repeatPassword", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <Button
                      type="submit"
                      className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? t.loading : t.signup}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    <span className="text-zinc-400">
                      {language === "es" ? "¿Ya tienes una cuenta? " : "Already have an account? "}
                    </span>
                    <Link
                      href="/auth/login"
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
                    >
                      {t.login}
                    </Link>
                  </div>
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
