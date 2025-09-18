// Language switching functionality
document.addEventListener("DOMContentLoaded", () => {
  const langEn = document.getElementById("lang-en")
  const langEs = document.getElementById("lang-es")

  // Language content
  const content = {
    en: {
      title: "Professional Landscape Solutions",
      subtitle:
        "Your trusted partner for irrigation, lighting, hardscape materials, and professional tools in Las Vegas.",
      shopNow: "Shop Now",
      contractorSignup: "Contractor Signup",
      shopByCategory: "Shop by Category",
      joinNetwork: "Join Our Contractor Network",
      networkSubtitle: "Get wholesale pricing, dedicated support, and priority access to new products.",
      wholesalePricing: "Wholesale Pricing",
      wholesaleDesc: "Save up to 30% on all products",
      freeDelivery: "Free Delivery",
      deliveryDesc: "On orders over $500",
      dedicatedSupport: "Dedicated Support",
      supportDesc: "Direct line to our experts",
      applyNow: "Apply Now",
      featuredProducts: "Featured Products",
      contactUs: "Contact Us",
      getInTouch: "Get in Touch",
    },
    es: {
      title: "Soluciones Profesionales de Paisajismo",
      subtitle:
        "Su socio de confianza para riego, iluminación, materiales de paisajismo duro y herramientas profesionales en Las Vegas.",
      shopNow: "Comprar Ahora",
      contractorSignup: "Registro de Contratista",
      shopByCategory: "Comprar por Categoría",
      joinNetwork: "Únase a Nuestra Red de Contratistas",
      networkSubtitle: "Obtenga precios al por mayor, soporte dedicado y acceso prioritario a nuevos productos.",
      wholesalePricing: "Precios al Por Mayor",
      wholesaleDesc: "Ahorre hasta 30% en todos los productos",
      freeDelivery: "Entrega Gratuita",
      deliveryDesc: "En pedidos superiores a $500",
      dedicatedSupport: "Soporte Dedicado",
      supportDesc: "Línea directa a nuestros expertos",
      applyNow: "Aplicar Ahora",
      featuredProducts: "Productos Destacados",
      contactUs: "Contáctanos",
      getInTouch: "Ponerse en Contacto",
    },
  }

  function switchLanguage(lang) {
    // Update button states
    if (lang === "en") {
      langEn.classList.add("bg-primary", "text-primary-foreground")
      langEn.classList.remove("bg-muted", "text-muted-foreground")
      langEs.classList.add("bg-muted", "text-muted-foreground")
      langEs.classList.remove("bg-primary", "text-primary-foreground")
    } else {
      langEs.classList.add("bg-primary", "text-primary-foreground")
      langEs.classList.remove("bg-muted", "text-muted-foreground")
      langEn.classList.add("bg-muted", "text-muted-foreground")
      langEn.classList.remove("bg-primary", "text-primary-foreground")
    }

    // Update content (basic implementation)
    const currentContent = content[lang]

    // Update main heading
    const mainHeading = document.querySelector("h1")
    if (mainHeading) {
      mainHeading.innerHTML = `<span class="text-primary">Professional</span><br>${lang === "en" ? "Landscape Solutions" : "Soluciones de Paisajismo"}`
    }

    // Update subtitle
    const subtitle = document.querySelector("h1 + p")
    if (subtitle) {
      subtitle.textContent = currentContent.subtitle
    }

    // Store language preference
    localStorage.setItem("preferred-language", lang)
  }

  // Event listeners
  langEn.addEventListener("click", () => switchLanguage("en"))
  langEs.addEventListener("click", () => switchLanguage("es"))

  // Load saved language preference
  const savedLang = localStorage.getItem("preferred-language") || "en"
  switchLanguage(savedLang)

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Form submission handler
  const contactForm = document.querySelector("form")
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()
      alert("Thank you for your message! We will get back to you soon.")
      this.reset()
    })
  }
})
