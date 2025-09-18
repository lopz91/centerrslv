"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calculator, RotateCcw } from "lucide-react"

interface CalculatorVariable {
  name: string
  label: string
  unit: string
  defaultValue?: number
}

interface ProductCalculator {
  id: string
  name: string
  category: string
  type: "tonnage" | "square_footage"
  formula: string
  variables: CalculatorVariable[]
  description: string
}

interface ProductCalculatorProps {
  category: string
  onCalculationComplete?: (result: any) => void
}

export function ProductCalculator({ category, onCalculationComplete }: ProductCalculatorProps) {
  const [calculators, setCalculators] = useState<ProductCalculator[]>([])
  const [selectedCalculator, setSelectedCalculator] = useState<ProductCalculator | null>(null)
  const [inputValues, setInputValues] = useState<Record<string, number>>({})
  const [result, setResult] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCalculators()
  }, [category])

  useEffect(() => {
    if (selectedCalculator) {
      // Initialize input values with defaults
      const initialValues: Record<string, number> = {}
      selectedCalculator.variables.forEach((variable) => {
        initialValues[variable.name] = variable.defaultValue || 0
      })
      setInputValues(initialValues)
      setResult(null)
    }
  }, [selectedCalculator])

  const fetchCalculators = async () => {
    try {
      const response = await fetch(`/api/calculators?category=${encodeURIComponent(category)}`)
      const data = await response.json()
      setCalculators(data.calculators || [])
      if (data.calculators?.length > 0) {
        setSelectedCalculator(data.calculators[0])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calculators",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculate = async () => {
    if (!selectedCalculator) return

    setIsCalculating(true)
    try {
      const response = await fetch("/api/calculators/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calculatorId: selectedCalculator.id,
          inputValues,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.result)
        onCalculationComplete?.(data)
        toast({
          title: "Calculation Complete",
          description: `Result: ${data.result.toFixed(2)} ${selectedCalculator.type === "tonnage" ? "tons" : "sq ft"}`,
        })
      } else {
        toast({
          title: "Calculation Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate result",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    if (selectedCalculator) {
      const initialValues: Record<string, number> = {}
      selectedCalculator.variables.forEach((variable) => {
        initialValues[variable.name] = variable.defaultValue || 0
      })
      setInputValues(initialValues)
      setResult(null)
    }
  }

  const updateInputValue = (variableName: string, value: number) => {
    setInputValues((prev) => ({
      ...prev,
      [variableName]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">Loading calculators...</div>
        </CardContent>
      </Card>
    )
  }

  if (calculators.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No calculators available for this category.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calculator Selection */}
      {calculators.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {calculators.map((calculator) => (
            <Button
              key={calculator.id}
              onClick={() => setSelectedCalculator(calculator)}
              variant={selectedCalculator?.id === calculator.id ? "default" : "outline"}
              size="sm"
            >
              {calculator.name}
            </Button>
          ))}
        </div>
      )}

      {selectedCalculator && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {selectedCalculator.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={selectedCalculator.type === "tonnage" ? "default" : "secondary"}>
                {selectedCalculator.type === "tonnage" ? "Tonnage Calculator" : "Square Footage Calculator"}
              </Badge>
            </div>
            {selectedCalculator.description && (
              <p className="text-sm text-muted-foreground">{selectedCalculator.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input Variables */}
            <div className="space-y-3">
              {selectedCalculator.variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={variable.name}>
                    {variable.label} {variable.unit && `(${variable.unit})`}
                  </Label>
                  <Input
                    id={variable.name}
                    type="number"
                    step="0.01"
                    min="0"
                    value={inputValues[variable.name] || ""}
                    onChange={(e) => updateInputValue(variable.name, Number.parseFloat(e.target.value) || 0)}
                    placeholder={`Enter ${variable.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleCalculate} disabled={isCalculating} className="flex-1">
                {isCalculating ? "Calculating..." : "Calculate"}
              </Button>
              <Button onClick={handleReset} variant="outline" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Result Display */}
            {result !== null && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Estimated Amount Needed:</div>
                  <div className="text-2xl font-bold text-primary">
                    {result.toFixed(2)} {selectedCalculator.type === "tonnage" ? "tons" : "sq ft"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    This is an estimate. Actual requirements may vary based on specific conditions.
                  </div>
                </div>
              </div>
            )}

            {/* Formula Display (for transparency) */}
            <div className="text-xs text-muted-foreground">
              <details>
                <summary className="cursor-pointer hover:text-foreground">View calculation formula</summary>
                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">{selectedCalculator.formula}</div>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
