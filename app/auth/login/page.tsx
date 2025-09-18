"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { toast } from "sonner"

export default function LoginPage() {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"

  const t = useTranslation(language)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}${redirectTo}`,
        },
      })
      if (error) throw error

      toast.success(language === "es" ? "Sesión iniciada exitosamente" : "Logged in successfully")
      router.push(redirectTo)
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
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white">{t.login}</CardTitle>
                <CardDescription className="text-zinc-400">
                  {language === "es"
                    ? "Ingresa tu email para acceder a tu cuenta"
                    : "Enter your email below to login to your account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-zinc-300">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-zinc-300">
                        {language === "es" ? "Contraseña" : "Password"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? t.loading : t.login}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    <span className="text-zinc-400">
                      {language === "es" ? "¿No tienes una cuenta? " : "Don't have an account? "}
                    </span>
                    <Link
                      href="/auth/signup"
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
                    >
                      {t.signup}
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
