"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, Users, Package, BarChart3, Calculator, MessageSquare, FileText, Database } from "lucide-react"

interface AdminNavProps {
  language: "en" | "es"
}

export function AdminNav({ language }: AdminNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/admin/dashboard",
      icon: BarChart3,
      label: language === "es" ? "Panel Principal" : "Dashboard",
    },
    {
      href: "/admin/users",
      icon: Users,
      label: language === "es" ? "Usuarios" : "Users",
    },
    {
      href: "/admin/products",
      icon: Package,
      label: language === "es" ? "Productos" : "Products",
    },
    {
      href: "/admin/orders",
      icon: FileText,
      label: language === "es" ? "Pedidos" : "Orders",
    },
    {
      href: "/admin/calculators",
      icon: Calculator,
      label: language === "es" ? "Calculadoras" : "Calculators",
    },
    {
      href: "/admin/zoho",
      icon: Database,
      label: language === "es" ? "Zoho Books" : "Zoho Books",
    },
    {
      href: "/admin/sms",
      icon: MessageSquare,
      label: language === "es" ? "SMS" : "SMS",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: language === "es" ? "Configuración" : "Settings",
    },
  ]

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                : "text-zinc-400 hover:text-amber-400 hover:bg-amber-400/5",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
