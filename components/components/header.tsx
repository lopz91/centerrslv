"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/i18n"
import { ShoppingCart, User, Menu, X, Phone, MapPin, Mail, Fan as Fax } from "lucide-react"

interface HeaderProps {
  language: "en" | "es"
  onLanguageChange: (language: "en" | "es") => void
  cartItemCount?: number
  isLoggedIn?: boolean
}

export function Header({ language, onLanguageChange, cartItemCount = 0, isLoggedIn = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslation(language)

  const navigation = [
    { name: t.home, href: "/" },
    { name: t.products, href: "/products" },
    {
      name: t.categories,
      href: "/categories",
      submenu: [
        { name: "Irrigation", href: "/products/irrigation" },
        { name: "Landscape Lighting", href: "/products/landscape-lighting" },
        {
          name: "Hardscape Materials",
          href: "/products/hardscape-materials",
          submenu: [
            { name: "Retaining Walls", href: "/products/retaining-walls" },
            { name: "45mm Pavers", href: "/products/45mm-pavers" },
            { name: "60mm Pavers", href: "/products/60mm-pavers" },
            { name: "Step Stones", href: "/products/step-stones" },
          ],
        },
        {
          name: "Bulk Materials",
          href: "/products/bulk-materials",
          submenu: [
            { name: "Bagged Rock", href: "/products/bagged-rock" },
            { name: "Decorative Rock", href: "/products/decorative-rock" },
            { name: "Fines", href: "/products/fines" },
            { name: "Base Material", href: "/products/base-material" },
          ],
        },
        { name: "Tools & Equipment", href: "/products/tools-equipment" },
        { name: "Fertilizers & Chemicals", href: "/products/fertilizers-chemicals" },
      ],
    },
    { name: "Tools", href: "/tools" },
    { name: "Find a Pro", href: "/find-a-pro" },
    { name: "Sales", href: "/sales" },
    { name: t.about, href: "/about" },
    { name: t.contact, href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar with contact info */}
      <div className="border-b border-border bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>(702) 899-8989</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="text-primary font-medium">Sales: (702) 400-3300</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>Info@lvcenters.com</span>
              </div>
              <div className="hidden lg:flex items-center gap-1">
                <Fax className="h-3 w-3" />
                <span>Fax: (702) 899-8989</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Serving Las Vegas, NV</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLanguage={language} onLanguageChange={onLanguageChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src="/images/lc-logo.png"
                alt="The Landscape Center"
                width={60}
                height={60}
                className="rounded-lg"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground font-[family-name:var(--font-playfair)]">
                The Landscape Center
              </h1>
              <p className="text-sm text-primary font-medium">Manufacturer to Jobsite Delivery</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                {item.submenu && (
                  <div className="absolute left-0 top-full bg-background/95 backdrop-blur border-t border-border w-full hidden group-hover:block">
                    <div className="container mx-auto px-4 py-4">
                      <nav className="flex flex-col space-y-4">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                        {item.submenu.some((subitem) => subitem.submenu) && (
                          <div className="flex flex-col space-y-4">
                            {item.submenu.map(
                              (subitem) =>
                                subitem.submenu && (
                                  <div key={subitem.name} className="relative group">
                                    <Link
                                      href={subitem.href}
                                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                      {subitem.name}
                                    </Link>
                                    <div className="absolute left-0 top-full bg-background/95 backdrop-blur border-t border-border w-full hidden group-hover:block">
                                      <div className="container mx-auto px-4 py-4">
                                        <nav className="flex flex-col space-y-4">
                                          {subitem.submenu.map((subsubitem) => (
                                            <Link
                                              key={subsubitem.name}
                                              href={subsubitem.href}
                                              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                            >
                                              {subsubitem.name}
                                            </Link>
                                          ))}
                                        </nav>
                                      </div>
                                    </div>
                                  </div>
                                ),
                            )}
                          </div>
                        )}
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center p-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User account */}
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    {t.login}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    {t.signup}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-muted-foreground hover:text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="absolute left-0 top-full bg-background/95 backdrop-blur border-t border-border w-full">
                      <div className="container mx-auto px-4 py-4">
                        <nav className="flex flex-col space-y-4">
                          {item.submenu.map((subitem) => (
                            <div key={subitem.name} className="relative">
                              <Link
                                href={subitem.href}
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {subitem.name}
                              </Link>
                              {subitem.submenu && (
                                <div className="absolute left-0 top-full bg-background/95 backdrop-blur border-t border-border w-full">
                                  <div className="container mx-auto px-4 py-4">
                                    <nav className="flex flex-col space-y-4">
                                      {subitem.submenu.map((subsubitem) => (
                                        <Link
                                          key={subsubitem.name}
                                          href={subsubitem.href}
                                          className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          {subsubitem.name}
                                        </Link>
                                      ))}
                                    </nav>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </nav>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!isLoggedIn && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary">
                      {t.login}
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      {t.signup}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
