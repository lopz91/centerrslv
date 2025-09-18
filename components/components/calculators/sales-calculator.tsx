"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, FileText, Send, Upload, Printer } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const projectTypes = {
  "paver-install": {
    name: "Paver Install",
    baseRate: 12,
    laborMultiplier: 1.5,
    description: "Complete paver installation with base preparation",
  },
  "turf-install": {
    name: "Turf Install",
    baseRate: 8,
    laborMultiplier: 1.2,
    description: "Artificial turf installation with proper base",
  },
  "rock-install": {
    name: "Rock Install",
    baseRate: 6,
    laborMultiplier: 1.0,
    description: "Decorative rock and stone installation",
  },
  "driveway-paving": {
    name: "Driveway Paving",
    baseRate: 15,
    laborMultiplier: 1.8,
    description: "Driveway paving with proper drainage",
  },
  "walkway-installation": {
    name: "Walkway Installation",
    baseRate: 10,
    laborMultiplier: 1.3,
    description: "Decorative walkway installation",
  },
  "pool-deck": {
    name: "Pool Deck",
    baseRate: 18,
    laborMultiplier: 2.0,
    description: "Pool deck with slip-resistant materials",
  },
  "retaining-wall": {
    name: "Retaining Wall",
    baseRate: 25,
    laborMultiplier: 2.5,
    description: "Structural retaining wall construction",
  },
  "landscape-design": {
    name: "Landscape Design",
    baseRate: 8,
    laborMultiplier: 1.2,
    description: "Complete landscape design and installation",
  },
}

const additionalServices = {
  excavation: { name: "Excavation", rate: 3.5, unit: "sq ft" },
  "base-preparation": { name: "Base Preparation", rate: 2.5, unit: "sq ft" },
  "drainage-system": { name: "Drainage System", rate: 8, unit: "linear ft" },
  "edge-restraints": { name: "Edge Restraints", rate: 4, unit: "linear ft" },
  "joint-sand": { name: "Joint Sand", rate: 1.5, unit: "sq ft" },
  sealing: { name: "Sealing", rate: 2, unit: "sq ft" },
  cleanup: { name: "Cleanup & Disposal", rate: 300, unit: "flat rate" }, // Updated to $300
}

interface EstimatorToolProps {
  userProfile?: { account_type: string } | null
}

export function SalesCalculator({ userProfile }: EstimatorToolProps) {
  const [projectType, setProjectType] = useState("")
  const [area, setArea] = useState("")
  const [perimeter, setPerimeter] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [materialCost, setMaterialCost] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [projectNotes, setProjectNotes] = useState("")
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [companyInfo, setCompanyInfo] = useState("")
  const [estimate, setEstimate] = useState<{
    materialCost: number
    laborCost: number
    servicesCost: number
    subtotal: number
    tax: number
    total: number
    projectTypeName: string
  } | null>(null)

  if (!userProfile || userProfile.account_type !== "contractor") {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Contractor Access Required</h3>
          <p className="text-muted-foreground">The Estimator Tool is only available to approved contractor accounts.</p>
        </CardContent>
      </Card>
    )
  }

  const calculateEstimate = () => {
    const areaValue = Number.parseFloat(area)
    const perimeterValue = Number.parseFloat(perimeter) || 0
    const materialCostValue = Number.parseFloat(materialCost) || 0

    if (areaValue && projectType) {
      const project = projectTypes[projectType as keyof typeof projectTypes]

      // Calculate labor cost
      const laborCost = areaValue * project.baseRate * project.laborMultiplier

      // Calculate additional services cost
      let servicesCost = 0
      selectedServices.forEach((serviceKey) => {
        const service = additionalServices[serviceKey as keyof typeof additionalServices]
        if (service) {
          if (service.unit === "sq ft") {
            servicesCost += areaValue * service.rate
          } else if (service.unit === "linear ft") {
            servicesCost += perimeterValue * service.rate
          } else {
            servicesCost += service.rate
          }
        }
      })

      const subtotal = materialCostValue + laborCost + servicesCost
      const tax = subtotal * 0.0825 // Nevada sales tax
      const total = subtotal + tax

      setEstimate({
        materialCost: materialCostValue,
        laborCost,
        servicesCost,
        subtotal,
        tax,
        total,
        projectTypeName: project.name,
      })
    }
  }

  const handleServiceToggle = (serviceKey: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceKey) ? prev.filter((s) => s !== serviceKey) : [...prev, serviceKey],
    )
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCompanyLogo(file)
    }
  }

  const printEstimate = async () => {
    if (!estimate) {
      toast({
        title: "No Estimate",
        description: "Please calculate an estimate first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Here you would integrate with a payment processor for the $2.99 fee
      const confirmed = window.confirm("Print estimate for $2.99?")
      if (confirmed) {
        // Generate printable estimate with company logo/info
        const printContent = generatePrintableEstimate()
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(printContent)
          printWindow.document.close()
          printWindow.print()
        }

        toast({
          title: "Estimate Printed",
          description: "Your estimate has been prepared for printing.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print estimate. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generatePrintableEstimate = () => {
    const logoUrl = companyLogo ? URL.createObjectURL(companyLogo) : ""

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Project Estimate</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { display: flex; align-items: center; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin-right: 20px; }
            .company-info { flex: 1; }
            .estimate-details { margin: 20px 0; }
            .cost-breakdown { border-collapse: collapse; width: 100%; }
            .cost-breakdown th, .cost-breakdown td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" class="logo">` : ""}
            <div class="company-info">
              <h2>${companyName || "Your Company Name"}</h2>
              <p>${companyInfo}</p>
            </div>
          </div>
          <h1>Project Estimate</h1>
          <div class="estimate-details">
            <p><strong>Project Type:</strong> ${estimate?.projectTypeName}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Area:</strong> ${area} sq ft</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="cost-breakdown">
            <tr><th>Item</th><th>Cost</th></tr>
            <tr><td>Materials</td><td>$${estimate?.materialCost.toFixed(2)}</td></tr>
            <tr><td>Labor</td><td>$${estimate?.laborCost.toFixed(2)}</td></tr>
            <tr><td>Additional Services</td><td>$${estimate?.servicesCost.toFixed(2)}</td></tr>
            <tr><td>Subtotal</td><td>$${estimate?.subtotal.toFixed(2)}</td></tr>
            <tr><td>Tax (8.25%)</td><td>$${estimate?.tax.toFixed(2)}</td></tr>
            <tr class="total"><td>Total</td><td>$${estimate?.total.toFixed(2)}</td></tr>
          </table>
        </body>
      </html>
    `
  }

  const generateQuote = async () => {
    if (!estimate || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer details and calculate estimate first.",
        variant: "destructive",
      })
      return
    }

    try {
      const quoteData = {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        project: {
          type: projectType,
          area: Number.parseFloat(area),
          perimeter: Number.parseFloat(perimeter) || 0,
          notes: projectNotes,
        },
        estimate,
        services: selectedServices,
        company: {
          name: companyName,
          info: companyInfo,
          logo: companyLogo?.name,
        },
        createdAt: new Date().toISOString(),
      }

      console.log("Quote data:", quoteData)

      toast({
        title: "Quote Generated",
        description: "Quote has been generated and saved to the system.",
      })

      // Reset form
      setCustomerName("")
      setCustomerEmail("")
      setCustomerPhone("")
      setProjectNotes("")
      setEstimate(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quote. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Details</CardTitle>
            <CardDescription>Enter the project specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(projectTypes).map(([key, project]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">{project.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-area">Area (sq ft)</Label>
                <Input
                  id="project-area"
                  type="number"
                  placeholder="Enter area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-perimeter">Perimeter (linear ft)</Label>
                <Input
                  id="project-perimeter"
                  type="number"
                  placeholder="Enter perimeter"
                  value={perimeter}
                  onChange={(e) => setPerimeter(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="material-cost">Material Cost ($)</Label>
              <Input
                id="material-cost"
                type="number"
                placeholder="Enter material cost"
                value={materialCost}
                onChange={(e) => setMaterialCost(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Additional Services</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(additionalServices).map(([key, service]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={selectedServices.includes(key)}
                      onChange={() => handleServiceToggle(key)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={key} className="text-sm flex-1">
                      {service.name} - ${service.rate}/{service.unit}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={calculateEstimate} className="w-full bg-primary hover:bg-primary/90">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Estimate
            </Button>
          </CardContent>
        </Card>

        {/* Customer & Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer & Company Information</CardTitle>
            <CardDescription>Enter customer details and your company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium">Your Company Information</h4>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter your company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-info">Company Information</Label>
                <Textarea
                  id="company-info"
                  placeholder="Address, phone, email, license info, etc."
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-logo">Company Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="company-logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {companyLogo && <p className="text-xs text-muted-foreground">Selected: {companyLogo.name}</p>}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-email">Email Address</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter email address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone Number</Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="Enter phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-notes">Project Notes</Label>
              <Textarea
                id="project-notes"
                placeholder="Additional project details, special requirements, etc."
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimate Results */}
      {estimate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Project Estimate - {estimate.projectTypeName}
            </CardTitle>
            <CardDescription>Detailed cost breakdown for the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Materials</p>
                <p className="text-2xl font-bold">${estimate.materialCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Labor</p>
                <p className="text-2xl font-bold">${estimate.laborCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Services</p>
                <p className="text-2xl font-bold">${estimate.servicesCost.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Tax (8.25%)</p>
                <p className="text-2xl font-bold">${estimate.tax.toFixed(2)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal: ${estimate.subtotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Tax: ${estimate.tax.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Project Cost</p>
                <p className="text-3xl font-bold text-primary">${estimate.total.toFixed(2)}</p>
              </div>
            </div>

            {selectedServices.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Included Services:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((serviceKey) => {
                    const service = additionalServices[serviceKey as keyof typeof additionalServices]
                    return (
                      <Badge key={serviceKey} variant="secondary">
                        {service?.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={generateQuote} className="flex-1 bg-primary hover:bg-primary/90">
                <FileText className="mr-2 h-4 w-4" />
                Generate Quote
              </Button>
              <Button onClick={printEstimate} variant="outline" className="flex-1 bg-transparent">
                <Printer className="mr-2 h-4 w-4" />
                Print Estimate ($2.99)
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Send className="mr-2 h-4 w-4" />
                Email to Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Estimates are based on standard pricing and may vary based on site conditions</p>
        <p>• Final pricing subject to site inspection and material availability</p>
        <p>• Nevada sales tax (8.25%) included in total</p>
        <p>• Print service fee of $2.99 applies for professional estimate formatting</p>
      </div>
    </div>
  )
}
