"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCalculator } from "@/components/product-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, Package } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface ProductCategoryPageProps {
  params: {
    category: string
  }
}

export default function ProductCategoryPage({ params }: ProductCategoryPageProps) {
  const [language, setLanguage] = useState<"en" | "es">("en")
  const [products, setProducts] = useState<any[]>([])
  const [calculators, setCalculators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { category } = params
  const decodedCategory = decodeURIComponent(category)
  const t = useTranslation(language)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [decodedCategory])

  const loadData = async () => {
    try {
      // Get products in this category
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("category", decodedCategory)
        .eq("is_active", true)
        .order("name")

      // Get calculators for this category
      const { data: calculatorsData } = await supabase
        .from("product_calculators")
        .select("*")
        .eq("category", decodedCategory)
        .eq("is_active", true)

      setProducts(productsData || [])
      setCalculators(calculatorsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">{t.loading}</p>
            </div>
          </div>
        </main>
        <Footer language={language} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} onLanguageChange={setLanguage} cartItemCount={0} isLoggedIn={false} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 capitalize">
            {language === "es" ? `Productos de ${decodedCategory}` : `${decodedCategory} Products`}
          </h1>
          <p className="text-muted-foreground">
            {language === "es"
              ? `Explora nuestra selección de productos de ${decodedCategory} y usa nuestras calculadoras para estimar tus necesidades.`
              : `Browse our selection of ${decodedCategory} products and use our calculators to estimate your needs.`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Calculator Section */}
          {calculators && calculators.length > 0 && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {language === "es" ? "Calculadora de Material" : "Material Calculator"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {language === "es"
                      ? "Calcula cuánto material necesitas para tu proyecto."
                      : "Calculate how much material you need for your project."}
                  </p>
                </CardHeader>
                <CardContent>
                  <ProductCalculator category={decodedCategory} language={language} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Grid */}
          <div className={calculators && calculators.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-6 w-6" />
                {language === "es" ? "Productos Disponibles" : "Available Products"}
              </h2>
            </div>

            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary">{product.unit}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {language === "es" ? "Precio Base:" : "Base Price:"}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            ${Number.parseFloat(product.base_price).toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
                          </span>
                        </div>

                        {product.contractor_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {language === "es" ? "Precio Contratista:" : "Contractor Price:"}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              ${Number.parseFloat(product.contractor_price).toFixed(2)}
                              <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
                            </span>
                          </div>
                        )}

                        {product.bulk_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {language === "es" ? "Precio Mayorista:" : "Bulk Price:"}
                            </span>
                            <span className="text-lg font-bold text-primary">
                              ${Number.parseFloat(product.bulk_price).toFixed(2)}
                              <span className="text-sm font-normal text-muted-foreground">/{product.unit}</span>
                            </span>
                          </div>
                        )}

                        {product.minimum_order && (
                          <div className="text-xs text-muted-foreground">
                            {language === "es" ? "Pedido mínimo:" : "Minimum order:"} {product.minimum_order}{" "}
                            {product.unit}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "es" ? "No Hay Productos Disponibles" : "No Products Available"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "es"
                    ? "Los productos para esta categoría se están actualizando. Por favor, vuelve pronto."
                    : "Products for this category are currently being updated. Please check back soon."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
