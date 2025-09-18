"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calculator, Plus, Edit, Trash2, Save } from "lucide-react"

interface CalculatorConfig {
  id?: string
  name: string
  category: string
  type: "tonnage" | "square_footage"
  formula: string
  variables: {
    name: string
    label: string
    unit: string
    defaultValue?: number
  }[]
  description: string
  isActive: boolean
}

export function CalculatorManager() {
  const [calculators, setCalculators] = useState<CalculatorConfig[]>([])
  const [editingCalculator, setEditingCalculator] = useState<CalculatorConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<CalculatorConfig>({
    name: "",
    category: "",
    type: "tonnage",
    formula: "",
    variables: [],
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchCalculators()
  }, [])

  const fetchCalculators = async () => {
    try {
      const response = await fetch("/api/admin/calculators")
      const data = await response.json()
      setCalculators(data.calculators || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch calculators",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/calculators", {
        method: editingCalculator ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: editingCalculator?.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: `Calculator ${editingCalculator ? "updated" : "created"} successfully`,
        })
        fetchCalculators()
        resetForm()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculator",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this calculator?")) return

    try {
      const response = await fetch(`/api/admin/calculators?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Calculator deleted successfully",
        })
        fetchCalculators()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete calculator",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (calculator: CalculatorConfig) => {
    setEditingCalculator(calculator)
    setFormData(calculator)
  }

  const resetForm = () => {
    setEditingCalculator(null)
    setFormData({
      name: "",
      category: "",
      type: "tonnage",
      formula: "",
      variables: [],
      description: "",
      isActive: true,
    })
  }

  const addVariable = () => {
    setFormData((prev) => ({
      ...prev,
      variables: [
        ...prev.variables,
        {
          name: "",
          label: "",
          unit: "",
          defaultValue: 0,
        },
      ],
    }))
  }

  const updateVariable = (index: number, field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.map((variable, i) => (i === index ? { ...variable, [field]: value } : variable)),
    }))
  }

  const removeVariable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }))
  }

  if (isLoading) {
    return <div className="p-6">Loading calculators...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calculator Management</h1>
        <Button onClick={() => resetForm()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Calculator
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingCalculator ? "Edit Calculator" : "Create New Calculator"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Calculator Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Mulch Calculator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., mulch, gravel, soil"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Calculator Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "tonnage" | "square_footage") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tonnage">Tonnage Calculator</SelectItem>
                  <SelectItem value="square_footage">Square Footage Calculator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this calculator does..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formula">Formula</Label>
              <Textarea
                id="formula"
                value={formData.formula}
                onChange={(e) => setFormData((prev) => ({ ...prev, formula: e.target.value }))}
                placeholder="e.g., (length * width * depth) / 27 for cubic yards"
                rows={2}
              />
              <div className="text-xs text-muted-foreground">
                Use variable names in curly braces, e.g., {"{length}"} * {"{width}"} * {"{depth}"}
              </div>
            </div>

            {/* Variables Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Variables</Label>
                <Button type="button" onClick={addVariable} size="sm" variant="outline">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Variable
                </Button>
              </div>

              {formData.variables.map((variable, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded">
                  <Input
                    placeholder="Variable name"
                    value={variable.name}
                    onChange={(e) => updateVariable(index, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Display label"
                    value={variable.label}
                    onChange={(e) => updateVariable(index, "label", e.target.value)}
                  />
                  <Input
                    placeholder="Unit (ft, in, etc.)"
                    value={variable.unit}
                    onChange={(e) => updateVariable(index, "unit", e.target.value)}
                  />
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="Default"
                      value={variable.defaultValue || ""}
                      onChange={(e) => updateVariable(index, "defaultValue", Number.parseFloat(e.target.value) || 0)}
                    />
                    <Button type="button" onClick={() => removeVariable(index)} size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              <Label htmlFor="isActive">Active (visible to customers)</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : editingCalculator ? "Update" : "Create"}
              </Button>
              {editingCalculator && (
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Calculators */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Calculators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calculators.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No calculators created yet. Create your first calculator to get started.
                </div>
              ) : (
                calculators.map((calculator) => (
                  <div key={calculator.id} className="border rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        <span className="font-medium">{calculator.name}</span>
                        <Badge variant={calculator.type === "tonnage" ? "default" : "secondary"}>
                          {calculator.type}
                        </Badge>
                        <Badge variant={calculator.isActive ? "default" : "secondary"}>
                          {calculator.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleEdit(calculator)} size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button onClick={() => handleDelete(calculator.id!)} size="sm" variant="destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Category: {calculator.category} | Variables: {calculator.variables.length}
                    </div>
                    <div className="text-sm">{calculator.description}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
