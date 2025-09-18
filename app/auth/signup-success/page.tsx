"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle, Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")

  return (
    <div className="min-h-screen bg-black">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />

      <main className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10">
                  <CheckCircle className="h-6 w-6 text-amber-400" />
                </div>
                <CardTitle className="text-2xl text-white">
                  {language === "es" ? "¡Gracias por registrarte!" : "Thank you for signing up!"}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {language === "es"
                    ? "Revisa tu email para confirmar tu cuenta"
                    : "Check your email to confirm your account"}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-zinc-300">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">
                    {language === "es"
                      ? "Te hemos enviado un enlace de confirmación"
                      : "We've sent you a confirmation link"}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">
                  {language === "es"
                    ? "Debes confirmar tu email antes de poder iniciar sesión y realizar pedidos."
                    : "You must confirm your email before you can sign in and place orders."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
