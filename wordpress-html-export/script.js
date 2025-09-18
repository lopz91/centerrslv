// Las Vegas Landscape Center - WordPress Compatible JavaScript

let currentLanguage = "en" // Declare currentLanguage variable

document.addEventListener("DOMContentLoaded", () => {
  // Language switching functionality
  const languageToggle = document.getElementById("language-toggle")
  const englishElements = document.querySelectorAll(".english")
  const spanishElements = document.querySelectorAll(".spanish")

  function switchLanguage() {
    if (currentLanguage === "en") {
      currentLanguage = "es"
      languageToggle.textContent = "EN"

      englishElements.forEach((el) => el.classList.add("hidden"))
      spanishElements.forEach((el) => el.classList.remove("hidden"))
    } else {
      currentLanguage = "en"
      languageToggle.textContent = "ES"

      spanishElements.forEach((el) => el.classList.add("hidden"))
      englishElements.forEach((el) => el.classList.remove("hidden"))
    }

    // Store language preference
    localStorage.setItem("preferred-language", currentLanguage)
  }

  // Load saved language preference
  const savedLanguage = localStorage.getItem("preferred-language")
  if (savedLanguage && savedLanguage !== currentLanguage) {
    switchLanguage()
  }

  languageToggle.addEventListener("click", switchLanguage)

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

  // Form submission handling
  const contactForm = document.querySelector("form")
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const name = formData.get("name") || this.querySelector('input[type="text"]').value
      const email = formData.get("email") || this.querySelector('input[type="email"]').value
      const message = formData.get("message") || this.querySelector("textarea").value

      // Basic validation
      if (!name || !email || !message) {
        alert(currentLanguage === "en" ? "Please fill in all fields." : "Por favor complete todos los campos.")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        alert(
          currentLanguage === "en"
            ? "Please enter a valid email address."
            : "Por favor ingrese una dirección de correo válida.",
        )
        return
      }

      // Simulate form submission
      const submitButton = this.querySelector('button[type="submit"]')
      const originalText = submitButton.textContent

      submitButton.textContent = currentLanguage === "en" ? "Sending..." : "Enviando..."
      submitButton.disabled = true

      // Simulate API call
      setTimeout(() => {
        alert(
          currentLanguage === "en"
            ? "Thank you for your message! We'll get back to you soon."
            : "¡Gracias por su mensaje! Nos pondremos en contacto pronto.",
        )

        // Reset form
        this.reset()
        submitButton.textContent = originalText
        submitButton.disabled = false
      }, 2000)
    })
  }

  // Mobile menu toggle (if needed)
  const mobileMenuButton = document.querySelector("[data-mobile-menu-toggle]")
  const mobileMenu = document.querySelector("[data-mobile-menu]")

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements for fade-in animation
  document.querySelectorAll(".card-gradient").forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(card)
  })

  // Calculator functionality placeholders
  document.querySelectorAll("button").forEach((button) => {
    if (button.textContent.includes("Calculator") || button.textContent.includes("Calculadora")) {
      button.addEventListener("click", () => {
        alert(currentLanguage === "en" ? "Calculator feature coming soon!" : "¡Función de calculadora próximamente!")
      })
    }

    if (button.textContent.includes("Contact Pro") || button.textContent.includes("Contactar")) {
      button.addEventListener("click", () => {
        alert(currentLanguage === "en" ? "Contact feature coming soon!" : "¡Función de contacto próximamente!")
      })
    }
  })

  // Dark mode toggle (optional)
  const darkModeToggle = document.querySelector("[data-dark-mode-toggle]")
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark")
      localStorage.setItem("dark-mode", document.documentElement.classList.contains("dark"))
    })

    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("dark-mode")
    if (savedDarkMode === "true") {
      document.documentElement.classList.add("dark")
    }
  }

  // Performance optimization: Lazy load images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img)
    })
  }
})

// Utility functions
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3]
  }
  return phone
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Export functions for WordPress integration
window.LVLandscapeCenter = {
  switchLanguage: (lang) => {
    if (lang === "es" && currentLanguage === "en") {
      document.getElementById("language-toggle").click()
    } else if (lang === "en" && currentLanguage === "es") {
      document.getElementById("language-toggle").click()
    }
  },
  getCurrentLanguage: () => currentLanguage,
  formatPhoneNumber: formatPhoneNumber,
  validateEmail: validateEmail,
}
