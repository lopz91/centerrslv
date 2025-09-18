"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Send, User, Phone, Mail, Home, Languages } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n"

const projectTypes = [
  { value: "lawn-maintenance", label_en: "Lawn Maintenance", label_es: "Mantenimiento de Césped" },
  { value: "paver-install", label_en: "Paver Install", label_es: "Instalación de Adoquines" },
  { value: "concrete-work", label_en: "Concrete Work", label_es: "Trabajo de Concreto" },
  { value: "retaining-wall", label_en: "Retaining Wall", label_es: "Muro de Contención" },
  { value: "drainage-system", label_en: "Drainage System", label_es: "Sistema de Drenaje" },
  { value: "junk-removal", label_en: "Junk Removal", label_es: "Remoción de Basura" },
  { value: "turf-install", label_en: "Turf Install", label_es: "Instalación de Césped" },
  { value: "rock-install", label_en: "Rock Install", label_es: "Instalación de Rocas" },
]

const languageOptions = [
  { value: "english", label_en: "English", label_es: "Inglés" },
  { value: "spanish", label_en: "Spanish", label_es: "Español" },
  { value: "both", label_en: "Both", label_es: "Ambos" },
]

interface CustomerSubmissionWidgetProps {
  language: "en" | "es"
  userProfile?: { account_type: string } | null
}

export function CustomerSubmissionWidget({ language, userProfile }: CustomerSubmissionWidgetProps) {
  const t = useTranslation(language)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    squareFootage: "",
    selectedProjects: [] as string[],
    preferredLanguages: [] as string[],
    additionalNotes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show for retail customers and non-account users
  if (userProfile && userProfile.account_type === "contractor") {
    return null // Don't show to contractors
  }

  const handleProjectToggle = (projectValue: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProjects: prev.selectedProjects.includes(projectValue)
        ? prev.selectedProjects.filter((p) => p !== projectValue)
        : [...prev.selectedProjects, projectValue],
    }))
  }

  const handleLanguageToggle = (languageValue: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(languageValue)
        ? prev.preferredLanguages.filter((l) => l !== languageValue)
        : [...prev.preferredLanguages, languageValue],
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || formData.selectedProjects.length === 0) {
      toast({
        title: language === "es" ? "Información Faltante" : "Missing Information",
        description:
          language === "es"
            ? "Por favor complete todos los campos requeridos y seleccione al menos un tipo de proyecto."
            : "Please fill in all required fields and select at least one project type.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submissionData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        language: language,
        source: "customer_submission_widget",
      }

      // Here you would typically send to your CRM or lead management system
      console.log("Customer submission:", submissionData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: language === "es" ? "Solicitud Enviada" : "Request Submitted",
        description:
          language === "es"
            ? "Gracias por su solicitud. Nos pondremos en contacto con usted pronto."
            : "Thank you for your request. We'll contact you soon.",
      })

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        squareFootage: "",
        selectedProjects: [],
        preferredLanguages: [],
        additionalNotes: "",
      })
    } catch (error) {
      toast({
        title: language === "es" ? "Error" : "Error",
        description:
          language === "es"
            ? "Error al enviar la solicitud. Por favor intente de nuevo."
            : "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <User className="h-5 w-5" />
          {language === "es" ? "Solicitar Servicios de Paisajismo" : "Request Landscaping Services"}
        </CardTitle>
        <CardDescription>
          {language === "es"
            ? "Complete este formulario para conectarse con profesionales de paisajismo en su área."
            : "Fill out this form to connect with landscaping professionals in your area."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === "es" ? "Información Personal" : "Personal Information"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t.name} *
                </Label>
                <Input
                  id="customer-name"
                  placeholder={language === "es" ? "Ingrese su nombre completo" : "Enter your full name"}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t.phoneNumber} *
                </Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="(702) 555-0123"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t.emailAddress} *
              </Label>
              <Input
                id="customer-email"
                type="email"
                placeholder={language === "es" ? "su.email@ejemplo.com" : "your.email@example.com"}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="square-footage" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t.squareFootage}
              </Label>
              <Input
                id="square-footage"
                type="number"
                placeholder={
                  language === "es" ? "Ingrese pies cuadrados aproximados" : "Enter approximate square footage"
                }
                value={formData.squareFootage}
                onChange={(e) => handleInputChange("squareFootage", e.target.value)}
              />
            </div>
          </div>

          {/* Project Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{language === "es" ? "Tipos de Proyecto" : "Project Types"} *</h3>
            <p className="text-sm text-muted-foreground">
              {language === "es"
                ? "Seleccione todos los servicios que le interesan:"
                : "Select all services you're interested in:"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectTypes.map((project) => (
                <div key={project.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={project.value}
                    checked={formData.selectedProjects.includes(project.value)}
                    onCheckedChange={() => handleProjectToggle(project.value)}
                  />
                  <Label htmlFor={project.value} className="text-sm cursor-pointer">
                    {language === "es" ? project.label_es : project.label_en}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t.preferredLanguage}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "es"
                ? "¿En qué idioma prefiere comunicarse?"
                : "What language(s) do you prefer to communicate in?"}
            </p>

            <div className="flex flex-wrap gap-4">
              {languageOptions.map((lang) => (
                <div key={lang.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={lang.value}
                    checked={formData.preferredLanguages.includes(lang.value)}
                    onCheckedChange={() => handleLanguageToggle(lang.value)}
                  />
                  <Label htmlFor={lang.value} className="text-sm cursor-pointer">
                    {language === "es" ? lang.label_es : lang.label_en}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additional-notes">{language === "es" ? "Notas Adicionales" : "Additional Notes"}</Label>
            <Textarea
              id="additional-notes"
              placeholder={
                language === "es"
                  ? "Describa su proyecto, cronograma, presupuesto o cualquier requisito especial..."
                  : "Describe your project, timeline, budget, or any special requirements..."
              }
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting
              ? language === "es"
                ? "Enviando..."
                : "Submitting..."
              : language === "es"
                ? "Enviar Solicitud"
                : "Submit Request"}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              {language === "es"
                ? "• Nos pondremos en contacto con usted dentro de 24 horas"
                : "• We'll contact you within 24 hours"}
            </p>
            <p>
              {language === "es"
                ? "• Todas las consultas son gratuitas y sin compromiso"
                : "• All consultations are free and no-obligation"}
            </p>
            <p>
              {language === "es"
                ? "• Trabajamos con profesionales licenciados y asegurados"
                : "• We work with licensed and insured professionals"}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
