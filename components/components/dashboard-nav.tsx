"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n"
import { User, ShoppingBag, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DashboardNavProps {
  language: "en" | "es"
}

export function DashboardNav({ language }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslation(language)
  const router = useRouter()
  const supabase = createClient()

  const navigation = [
    {
      name: language === "es" ? "Perfil" : "Profile",
      href: "/dashboard",
      icon: User,
    },
    {
      name: language === "es" ? "Mis Pedidos" : "My Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      name: language === "es" ? "Configuración" : "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success(language === "es" ? "Sesión cerrada" : "Logged out successfully")
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error(language === "es" ? "Error al cerrar sesión" : "Error logging out")
    }
  }

  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-amber-400/10 text-amber-400" : "text-zinc-400 hover:text-amber-400 hover:bg-amber-400/5",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        )
      })}

      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full justify-start text-zinc-400 hover:text-red-400 hover:bg-red-400/5"
      >
        <LogOut className="h-4 w-4 mr-3" />
        {t.logout}
      </Button>
    </nav>
  )
}
