"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { toast } from "sonner"
import { Star, Truck, DollarSign, Building } from "lucide-react"

export default function ContractorRegisterPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
    phone: "",
    businessDescription: "",
    specialties: [] as string[],
    yearsInBusiness: "",
    licenseNumber: "",
    serviceAreas: "",
    agreeToTerms: false,
    requestSalesContact: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const t = useTranslation(language)

  const specialtyOptions = [
    { value: "landscaping", label: language === "es" ? "Paisajismo" : "Landscaping" },
    { value: "irrigation", label: language === "es" ? "Riego" : "Irrigation" },
    { value: "hardscape", label: language === "es" ? "Materiales Duros" : "Hardscape" },
    { value: "lighting", label: language === "es" ? "Iluminación" : "Lighting" },
    { value: "maintenance", label: language === "es" ? "Mantenimiento" : "Maintenance" },
    { value: "design", label: language === "es" ? "Diseño" : "Design" },
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: language === "es" ? "Precios Especiales" : "Special Pricing",
      description:
        language === "es"
          ? "Acceso a descuentos exclusivos para contratistas"
          : "Access to exclusive contractor discounts",
    },
    {
      icon: Truck,
      title: language === "es" ? "Entrega Directa" : "Direct Delivery",
      description: language === "es" ? "Del fabricante al sitio de trabajo" : "Manufacturer to jobsite delivery",
    },
    {
      icon: Star,
      title: language === "es" ? "Perfil en Find a Pro" : "Find a Pro Profile",
      description:
        language === "es" ? "Aparece en nuestro directorio de contratistas" : "Featured in our contractor directory",
    },
    {
      icon: Building,
      title: language === "es" ? "Soporte Comercial" : "Business Support",
      description: language === "es" ? "Representante de ventas dedicado" : "Dedicated sales representative",
    },
  ]

  const tiers = [
    { name: language === "es" ? "Estándar" : "Standard", color: "bg-gray-600" },
    { name: language === "es" ? "Premium" : "Premium", color: "bg-yellow-600" },
    { name: language === "es" ? "Elite" : "Elite", color: "bg-yellow-400" },
  ]

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError(language === "es" ? "Las contraseñas no coinciden" : "Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError(
        language === "es" ? "Debes aceptar los términos y condiciones" : "You must agree to the terms and conditions",
      )
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
            account_type: "contractor",
            business_description: formData.businessDescription,
            specialties: formData.specialties,
            years_in_business: formData.yearsInBusiness,
            license_number: formData.licenseNumber,
            service_areas: formData.serviceAreas,
            request_sales_contact: formData.requestSalesContact,
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
              account_type: "contractor",
            }),
          })
        } catch (profileError) {
          console.error("Error creating customer profile:", profileError)
        }
      }

      toast.success(language === "es" ? "Registro exitoso" : "Registration successful")
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

      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                {language === "es" ? "Registro de Contratista" : "Contractor Registration"}
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                {language === "es"
                  ? "Únete a nuestra red de contratistas profesionales y obtén acceso a precios especiales, entrega directa y más beneficios exclusivos."
                  : "Join our network of professional contractors and get access to special pricing, direct delivery, and exclusive benefits."}
              </p>
            </div>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-zinc-800 bg-zinc-900/50 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-zinc-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Membership Tiers */}
            <Card className="border-zinc-800 bg-zinc-900/50 mb-12">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  {language === "es" ? "Niveles de Membresía" : "Membership Tiers"}
                </CardTitle>
                <CardDescription className="text-center">
                  {language === "es"
                    ? "Los beneficios se basan en el volumen de compras anuales"
                    : "Benefits based on annual purchase volume"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  {tiers.map((tier, index) => (
                    <Badge key={index} className={`${tier.color} text-black font-semibold text-base px-4 py-2`}>
                      {tier.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  {language === "es" ? "Información de Registro" : "Registration Information"}
                </CardTitle>
                <CardDescription>
                  {language === "es"
                    ? "Complete el formulario para crear su cuenta de contratista"
                    : "Complete the form to create your contractor account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-zinc-300">
                        {language === "es" ? "Nombre" : "First Name"} *
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
                    <div>
                      <Label htmlFor="lastName" className="text-zinc-300">
                        {language === "es" ? "Apellido" : "Last Name"} *
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-zinc-300">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-zinc-300">
                        {language === "es" ? "Teléfono" : "Phone"} *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Business Information */}
                  <div>
                    <Label htmlFor="companyName" className="text-zinc-300">
                      {language === "es" ? "Nombre de la Empresa" : "Company Name"} *
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessDescription" className="text-zinc-300">
                      {language === "es" ? "Descripción del Negocio" : "Business Description"}
                    </Label>
                    <Textarea
                      id="businessDescription"
                      value={formData.businessDescription}
                      onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearsInBusiness" className="text-zinc-300">
                        {language === "es" ? "Años en el Negocio" : "Years in Business"}
                      </Label>
                      <Input
                        id="yearsInBusiness"
                        type="number"
                        value={formData.yearsInBusiness}
                        onChange={(e) => handleInputChange("yearsInBusiness", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber" className="text-zinc-300">
                        {language === "es" ? "Número de Licencia" : "License Number"}
                      </Label>
                      <Input
                        id="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <Label className="text-zinc-300 mb-3 block">
                      {language === "es" ? "Especialidades" : "Specialties"}
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specialtyOptions.map((specialty) => (
                        <div key={specialty.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty.value}
                            checked={formData.specialties.includes(specialty.value)}
                            onCheckedChange={() => handleSpecialtyToggle(specialty.value)}
                            className="border-zinc-600"
                          />
                          <Label htmlFor={specialty.value} className="text-zinc-300 text-sm">
                            {specialty.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="serviceAreas" className="text-zinc-300">
                      {language === "es" ? "Áreas de Servicio" : "Service Areas"}
                    </Label>
                    <Input
                      id="serviceAreas"
                      type="text"
                      placeholder={
                        language === "es" ? "Las Vegas, Henderson, Summerlin..." : "Las Vegas, Henderson, Summerlin..."
                      }
                      value={formData.serviceAreas}
                      onChange={(e) => handleInputChange("serviceAreas", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  {/* Password */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password" className="text-zinc-300">
                        {language === "es" ? "Contraseña" : "Password"} *
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
                    <div>
                      <Label htmlFor="repeatPassword" className="text-zinc-300">
                        {language === "es" ? "Confirmar Contraseña" : "Confirm Password"} *
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
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="requestSalesContact"
                        checked={formData.requestSalesContact}
                        onCheckedChange={(checked) => handleInputChange("requestSalesContact", checked as boolean)}
                        className="border-zinc-600 mt-1"
                      />
                      <div>
                        <Label htmlFor="requestSalesContact" className="text-zinc-300 font-medium">
                          {language === "es" ? "Solicitar contacto de ventas" : "Request sales contact"}
                        </Label>
                        <p className="text-sm text-zinc-500">
                          {language === "es"
                            ? "Un representante de ventas se pondrá en contacto conmigo para discutir precios especiales y beneficios."
                            : "A sales representative will contact me to discuss special pricing and benefits."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                        className="border-zinc-600 mt-1"
                      />
                      <div>
                        <Label htmlFor="agreeToTerms" className="text-zinc-300 font-medium">
                          {language === "es"
                            ? "Acepto los términos y condiciones"
                            : "I agree to the terms and conditions"}{" "}
                          *
                        </Label>
                        <p className="text-sm text-zinc-500">
                          {language === "es" ? "Al registrarme, acepto los " : "By registering, I agree to the "}
                          <Link href="/terms" className="text-amber-400 hover:text-amber-300">
                            {language === "es" ? "términos de servicio" : "terms of service"}
                          </Link>
                          {language === "es" ? " y la " : " and "}
                          <Link href="/privacy" className="text-amber-400 hover:text-amber-300">
                            {language === "es" ? "política de privacidad" : "privacy policy"}
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold py-3"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? language === "es"
                        ? "Creando cuenta..."
                        : "Creating account..."
                      : language === "es"
                        ? "Crear Cuenta de Contratista"
                        : "Create Contractor Account"}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-zinc-400">
                      {language === "es" ? "¿Ya tienes una cuenta? " : "Already have an account? "}
                    </span>
                    <Link
                      href="/auth/login"
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
                    >
                      {language === "es" ? "Iniciar sesión" : "Sign in"}
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
