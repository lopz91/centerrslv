"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Grid, Square, Frame } from "lucide-react"

const paverPatterns = {
  "running-bond": {
    name: "Running Bond",
    wastePercent: 5,
    description: "Classic brick-like pattern with offset joints",
  },
  herringbone: {
    name: "Herringbone",
    wastePercent: 10,
    description: "Interlocking V-shaped pattern",
  },
  "basket-weave": {
    name: "Basket Weave",
    wastePercent: 8,
    description: "Alternating horizontal and vertical pairs",
  },
  "stack-bond": {
    name: "Stack Bond",
    wastePercent: 3,
    description: "Straight grid pattern with aligned joints",
  },
  "random-pattern": {
    name: "Random Pattern",
    wastePercent: 15,
    description: "Mixed sizes in random arrangement",
  },
  "t-pattern": {
    name: "T Pattern",
    wastePercent: 12,
    description: '75% rectangle 6"x9" and 25% square 6"x6"',
  },
}

const paverSizes = {
  "4x8": { width: 4, length: 8, sqft: (4 * 8) / 144, name: '4" x 8"', palletSqft: 145 },
  "6x6": { width: 6, length: 6, sqft: (6 * 6) / 144, name: '6" x 6"', palletSqft: 140 },
  "6x9": { width: 6, length: 9, sqft: (6 * 9) / 144, name: '6" x 9"', palletSqft: 160 },
  "8x8": { width: 8, length: 8, sqft: (8 * 8) / 144, name: '8" x 8"', palletSqft: 128 },
  "12x12": { width: 12, length: 12, sqft: (12 * 12) / 144, name: '12" x 12"', palletSqft: 144 },
  "16x16": { width: 16, length: 16, sqft: (16 * 16) / 144, name: '16" x 16"', palletSqft: 178 },
}

const tilePatterns = {
  "straight-lay": {
    name: "Straight Lay",
    wastePercent: 5,
    description: "Tiles aligned in straight rows and columns",
  },
  diagonal: {
    name: "Diagonal",
    wastePercent: 15,
    description: "Tiles rotated 45 degrees",
  },
  "brick-pattern": {
    name: "Brick Pattern",
    wastePercent: 8,
    description: "Offset pattern like bricks",
  },
  herringbone: {
    name: "Herringbone",
    wastePercent: 12,
    description: "V-shaped interlocking pattern",
  },
}

const tileSizes = {
  "12x12": { width: 12, length: 12, sqft: 1, name: '12" x 12"' },
  "18x18": { width: 18, length: 18, sqft: 2.25, name: '18" x 18"' },
  "24x24": { width: 24, length: 24, sqft: 4, name: '24" x 24"' },
  "12x24": { width: 12, length: 24, sqft: 2, name: '12" x 24"' },
  "6x24": { width: 6, length: 24, sqft: 1, name: '6" x 24"' },
}

const borderPaverSizes = {
  "6x9": { width: 6, length: 9, name: '6" x 9"' },
  "4x8": { width: 4, length: 8, name: '4" x 8"' },
  "6x6": { width: 6, length: 6, name: '6" x 6"' },
}

const borderStyles = {
  sailor: { name: "Sailor Course", description: "Pavers laid with length parallel to border" },
  soldier: { name: "Soldier Course", description: "Pavers laid with width parallel to border" },
}

export function PatternCalculator() {
  const [area, setArea] = useState("")
  const [paverPattern, setPaverPattern] = useState("")
  const [paverSize, setPaverSize] = useState("")
  const [selectedPaverSizes, setSelectedPaverSizes] = useState<string[]>([])
  const [tilePattern, setTilePattern] = useState("")
  const [tileSize, setTileSize] = useState("")

  const [borderLinearFeet, setBorderLinearFeet] = useState("")
  const [borderPaverSize, setBorderPaverSize] = useState("")
  const [borderStyle, setBorderStyle] = useState("")

  const [paverResult, setPaverResult] = useState<{
    totalPavers: number
    totalSqft: number
    wastePercent: number
    recommendedOrder: number
    patternName: string
    paverBreakdown?: { size: string; count: number; pallets: number }[]
    totalPallets?: number
  } | null>(null)

  const [tileResult, setTileResult] = useState<{
    totalTiles: number
    totalSqft: number
    wastePercent: number
    recommendedOrder: number
    patternName: string
  } | null>(null)

  const [borderResult, setBorderResult] = useState<{
    totalPavers: number
    linearFeet: number
    paverSize: string
    borderStyle: string
  } | null>(null)

  const calculatePavers = () => {
    const areaValue = Number.parseFloat(area)
    if (areaValue && paverPattern && (paverSize || selectedPaverSizes.length > 0)) {
      const pattern = paverPatterns[paverPattern as keyof typeof paverPatterns]

      let totalPavers = 0
      let paverBreakdown: { size: string; count: number; pallets: number }[] = []
      let totalPallets = 0

      if (paverPattern === "t-pattern") {
        const size6x9 = paverSizes["6x9"]
        const size6x6 = paverSizes["6x6"]

        const area6x9 = areaValue * 0.75
        const area6x6 = areaValue * 0.25

        const pavers6x9 = Math.ceil(area6x9 / size6x9.sqft)
        const pavers6x6 = Math.ceil(area6x6 / size6x6.sqft)

        const pallets6x9 = Math.ceil(area6x9 / size6x9.palletSqft)
        const pallets6x6 = Math.ceil(area6x6 / size6x6.palletSqft)

        totalPavers = pavers6x9 + pavers6x6
        totalPallets = pallets6x9 + pallets6x6

        paverBreakdown = [
          { size: '6" x 9"', count: pavers6x9, pallets: pallets6x9 },
          { size: '6" x 6"', count: pavers6x6, pallets: pallets6x6 },
        ]
      } else if (paverSize) {
        const size = paverSizes[paverSize as keyof typeof paverSizes]
        totalPavers = Math.ceil(areaValue / size.sqft)
        totalPallets = Math.ceil(areaValue / size.palletSqft)
      }

      const wasteAmount = Math.ceil(totalPavers * (pattern.wastePercent / 100))
      const totalWithWaste = totalPavers + wasteAmount

      setPaverResult({
        totalPavers,
        totalSqft: areaValue,
        wastePercent: pattern.wastePercent,
        recommendedOrder: totalWithWaste,
        patternName: pattern.name,
        paverBreakdown: paverBreakdown.length > 0 ? paverBreakdown : undefined,
        totalPallets,
      })
    }
  }

  const calculateTiles = () => {
    const areaValue = Number.parseFloat(area)
    if (areaValue && tilePattern && tileSize) {
      const pattern = tilePatterns[tilePattern as keyof typeof tilePatterns]
      const size = tileSizes[tileSize as keyof typeof tileSizes]

      const tilesNeeded = Math.ceil(areaValue / size.sqft)
      const wasteAmount = Math.ceil(tilesNeeded * (pattern.wastePercent / 100))
      const totalWithWaste = tilesNeeded + wasteAmount

      setTileResult({
        totalTiles: tilesNeeded,
        totalSqft: areaValue,
        wastePercent: pattern.wastePercent,
        recommendedOrder: totalWithWaste,
        patternName: pattern.name,
      })
    }
  }

  const calculateBorder = () => {
    const linearFeetValue = Number.parseFloat(borderLinearFeet)
    if (linearFeetValue && borderPaverSize && borderStyle) {
      const size = borderPaverSizes[borderPaverSize as keyof typeof borderPaverSizes]
      const style = borderStyles[borderStyle as keyof typeof borderStyles]

      const linearInches = linearFeetValue * 12

      const paverDimension = borderStyle === "sailor" ? size.length : size.width

      const totalPavers = Math.ceil(linearInches / paverDimension)

      setBorderResult({
        totalPavers,
        linearFeet: linearFeetValue,
        paverSize: size.name,
        borderStyle: style.name,
      })
    }
  }

  const handlePaverSizeSelection = (sizeKey: string, checked: boolean) => {
    if (checked) {
      setSelectedPaverSizes([...selectedPaverSizes, sizeKey])
    } else {
      setSelectedPaverSizes(selectedPaverSizes.filter((s) => s !== sizeKey))
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="total-area">Total Area (square feet)</Label>
        <Input
          id="total-area"
          type="number"
          placeholder="Enter total area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pavers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pavers">Pavers</TabsTrigger>
          <TabsTrigger value="tiles">Tiles</TabsTrigger>
          <TabsTrigger value="border">Border</TabsTrigger>
        </TabsList>

        <TabsContent value="pavers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Grid className="h-5 w-5" />
                Paver Pattern Calculator
              </CardTitle>
              <CardDescription>Calculate pavers and pallets needed for different laying patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paver-pattern">Pattern Type</Label>
                  <Select value={paverPattern} onValueChange={setPaverPattern}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paverPatterns).map(([key, pattern]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{pattern.name}</div>
                            <div className="text-xs text-muted-foreground">{pattern.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {paverPattern === "t-pattern" ? (
                  <div className="space-y-2">
                    <Label>T Pattern (Fixed Sizes)</Label>
                    <div className="bg-muted/30 p-3 rounded text-sm">
                      <p className="font-medium mb-1">Automatically uses:</p>
                      <p>• 75% - 6" x 9" pavers</p>
                      <p>• 25% - 6" x 6" pavers</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="paver-size">Paver Size</Label>
                    <Select value={paverSize} onValueChange={setPaverSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paverSizes).map(([key, size]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{size.name}</div>
                              <div className="text-xs text-muted-foreground">{size.palletSqft} sq ft per pallet</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button onClick={calculatePavers} className="w-full bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Pavers and Pallets Needed
              </Button>

              {paverResult && (
                <div className="bg-primary/10 p-6 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-primary">{paverResult.patternName} Pattern Results:</h3>

                  {paverResult.paverBreakdown && (
                    <div className="bg-background/50 p-3 rounded mb-3">
                      <p className="font-medium mb-2">Paver & Pallet Breakdown:</p>
                      {paverResult.paverBreakdown.map((item, index) => (
                        <div key={index} className="text-sm mb-1">
                          <p className="font-medium">{item.size}:</p>
                          <p className="ml-2">• {item.count} pavers</p>
                          <p className="ml-2">• {item.pallets} pallets</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Base Requirement</p>
                      <p>{paverResult.totalPavers} pavers</p>
                      <p>{paverResult.totalSqft} sq ft</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Pallets Needed</p>
                      <p className="text-lg font-bold text-primary">{paverResult.totalPallets} pallets</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Waste Factor</p>
                      <p>{paverResult.wastePercent}% for pattern</p>
                      <p>+{paverResult.recommendedOrder - paverResult.totalPavers} pavers</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Total Order</p>
                      <p className="text-lg font-bold text-primary">{paverResult.recommendedOrder} pavers</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Square className="h-5 w-5" />
                Tile Pattern Calculator
              </CardTitle>
              <CardDescription>Calculate tiles needed for different laying patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tile-pattern">Pattern Type</Label>
                  <Select value={tilePattern} onValueChange={setTilePattern}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tilePatterns).map(([key, pattern]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{pattern.name}</div>
                            <div className="text-xs text-muted-foreground">{pattern.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tile-size">Tile Size</Label>
                  <Select value={tileSize} onValueChange={setTileSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(tileSizes).map(([key, size]) => (
                        <SelectItem key={key} value={key}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateTiles} className="w-full bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Tiles Needed
              </Button>

              {tileResult && (
                <div className="bg-primary/10 p-6 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-primary">{tileResult.patternName} Pattern Results:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Base Requirement</p>
                      <p>{tileResult.totalTiles} tiles</p>
                      <p>{tileResult.totalSqft} sq ft</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Waste Factor</p>
                      <p>{tileResult.wastePercent}% for pattern</p>
                      <p>+{tileResult.recommendedOrder - tileResult.totalTiles} tiles</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Total Order</p>
                      <p className="text-lg font-bold text-primary">{tileResult.recommendedOrder} tiles</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="border" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Frame className="h-5 w-5" />
                Border Calculator
              </CardTitle>
              <CardDescription>Calculate pavers needed for border installation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="border-linear-feet">Linear Feet</Label>
                  <Input
                    id="border-linear-feet"
                    type="number"
                    placeholder="Enter linear feet"
                    value={borderLinearFeet}
                    onChange={(e) => setBorderLinearFeet(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-paver-size">Border Paver Size</Label>
                  <Select value={borderPaverSize} onValueChange={setBorderPaverSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(borderPaverSizes).map(([key, size]) => (
                        <SelectItem key={key} value={key}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="border-style">Border Style</Label>
                  <Select value={borderStyle} onValueChange={setBorderStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(borderStyles).map(([key, style]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Border Style Guide:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">Sailor Course:</p>
                    <div className="bg-background p-2 rounded border-2 border-dashed">
                      <div className="flex gap-1">
                        <div className="w-8 h-4 bg-primary/30 border"></div>
                        <div className="w-8 h-4 bg-primary/30 border"></div>
                        <div className="w-8 h-4 bg-primary/30 border"></div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Length parallel to border</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Soldier Course:</p>
                    <div className="bg-background p-2 rounded border-2 border-dashed">
                      <div className="flex gap-1">
                        <div className="w-4 h-8 bg-primary/30 border"></div>
                        <div className="w-4 h-8 bg-primary/30 border"></div>
                        <div className="w-4 h-8 bg-primary/30 border"></div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Width parallel to border</p>
                  </div>
                </div>
              </div>

              <Button onClick={calculateBorder} className="w-full bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Border Pavers
              </Button>

              {borderResult && (
                <div className="bg-primary/10 p-6 rounded-lg space-y-3">
                  <h3 className="text-lg font-semibold text-primary">Border Calculation Results:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Project Details</p>
                      <p>{borderResult.linearFeet} linear feet</p>
                      <p>{borderResult.paverSize}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Border Style</p>
                      <p>{borderResult.borderStyle}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-medium">Total Pavers Needed</p>
                      <p className="text-lg font-bold text-primary">{borderResult.totalPavers} pavers</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Pallet coverage: 4x8 = 145 sq ft, 6"x9" = 160 sq ft, 6"x6" = 140 sq ft</p>
        <p>• Waste percentages vary by pattern complexity and cutting requirements</p>
        <p>• Diagonal patterns require more cuts and higher waste factors</p>
        <p>• Always order 5-10% extra for future repairs and replacements</p>
        <p>• Border calculations assume single-row installation</p>
      </div>
    </div>
  )
}
