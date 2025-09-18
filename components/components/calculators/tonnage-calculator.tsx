"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

const materials = {
  fines: { density: 1.4, name: "Fines" },
  "3-8-to-1-2": { density: 1.5, name: '3/8"-1/2"' },
  "3-4-to-1": { density: 1.6, name: '3/4"-1"' },
  "1-to-4": { density: 1.7, name: '1"-4"' },
}

export function TonnageCalculator() {
  const [area, setArea] = useState("")
  const [depth, setDepth] = useState("")
  const [material, setMaterial] = useState("")
  const [result, setResult] = useState<{
    cubicFeet: number
    cubicYards: number
    tons: number
    materialName: string
  } | null>(null)

  const calculate = () => {
    const areaValue = Number.parseFloat(area)
    const depthValue = Number.parseFloat(depth)

    if (areaValue && depthValue && material) {
      const selectedMaterial = materials[material as keyof typeof materials]

      // Convert depth from inches to feet
      const depthInFeet = depthValue / 12

      // Calculate volume
      const cubicFeet = areaValue * depthInFeet
      const cubicYards = cubicFeet / 27

      // Calculate weight in tons
      const tons = cubicYards * selectedMaterial.density

      setResult({
        cubicFeet,
        cubicYards,
        tons,
        materialName: selectedMaterial.name,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Material Tonnage Calculator</CardTitle>
        <CardDescription>Calculate the amount of material needed for your project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="area">Area (square feet)</Label>
            <Input
              id="area"
              type="number"
              placeholder="Enter area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depth">Depth (inches)</Label>
            <Input
              id="depth"
              type="number"
              placeholder="Enter depth"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="material">Material Type</Label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(materials).map(([key, mat]) => (
                  <SelectItem key={key} value={key}>
                    {mat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={calculate} className="w-full bg-primary hover:bg-primary/90">
          <Calculator className="mr-2 h-4 w-4" />
          Calculate Material Needed
        </Button>

        {result && (
          <div className="bg-primary/10 p-6 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold text-primary">{result.materialName} Required:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-background/50 p-3 rounded">
                <p className="font-medium">Volume</p>
                <p>{result.cubicFeet.toFixed(2)} cubic feet</p>
                <p>{result.cubicYards.toFixed(2)} cubic yards</p>
              </div>
              <div className="bg-background/50 p-3 rounded">
                <p className="font-medium">Weight</p>
                <p className="text-lg font-bold text-primary">{result.tons.toFixed(2)} tons</p>
              </div>
              <div className="bg-background/50 p-3 rounded">
                <p className="font-medium">Recommended Order</p>
                <p className="text-lg font-bold text-primary">{Math.ceil(result.tons * 1.1).toFixed(1)} tons</p>
                <p className="text-xs text-muted-foreground">+10% for waste/compaction</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Calculations are estimates based on standard material densities</p>
          <p>• Add 10% extra for waste and compaction</p>
          <p>• Contact us for precise calculations on large projects</p>
        </div>
      </CardContent>
    </Card>
  )
}
