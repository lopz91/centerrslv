"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator } from "lucide-react"

export function SquareFootageCalculator() {
  const [rectangleLength, setRectangleLength] = useState("")
  const [rectangleWidth, setRectangleWidth] = useState("")
  const [circleRadius, setCircleRadius] = useState("")
  const [triangleBase, setTriangleBase] = useState("")
  const [triangleHeight, setTriangleHeight] = useState("")
  const [results, setResults] = useState<{ [key: string]: number }>({})

  const calculateRectangle = () => {
    const length = Number.parseFloat(rectangleLength)
    const width = Number.parseFloat(rectangleWidth)
    if (length && width) {
      const area = length * width
      setResults((prev) => ({ ...prev, rectangle: area }))
    }
  }

  const calculateCircle = () => {
    const radius = Number.parseFloat(circleRadius)
    if (radius) {
      const area = Math.PI * radius * radius
      setResults((prev) => ({ ...prev, circle: area }))
    }
  }

  const calculateTriangle = () => {
    const base = Number.parseFloat(triangleBase)
    const height = Number.parseFloat(triangleHeight)
    if (base && height) {
      const area = (base * height) / 2
      setResults((prev) => ({ ...prev, triangle: area }))
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rectangle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rectangle">Rectangle</TabsTrigger>
          <TabsTrigger value="circle">Circle</TabsTrigger>
          <TabsTrigger value="triangle">Triangle</TabsTrigger>
        </TabsList>

        <TabsContent value="rectangle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rectangle/Square Area</CardTitle>
              <CardDescription>Calculate area for rectangular or square spaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rectangle-length">Length (feet)</Label>
                  <Input
                    id="rectangle-length"
                    type="number"
                    placeholder="Enter length"
                    value={rectangleLength}
                    onChange={(e) => setRectangleLength(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rectangle-width">Width (feet)</Label>
                  <Input
                    id="rectangle-width"
                    type="number"
                    placeholder="Enter width"
                    value={rectangleWidth}
                    onChange={(e) => setRectangleWidth(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={calculateRectangle} className="w-full bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Rectangle Area
              </Button>
              {results.rectangle && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    Area: <span className="text-primary">{results.rectangle.toFixed(2)} sq ft</span>
                  </p>
                  <p className="text-sm text-muted-foreground">({(results.rectangle / 9).toFixed(2)} square yards)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Circular Area</CardTitle>
              <CardDescription>Calculate area for circular spaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="circle-radius">Radius (feet)</Label>
                <Input
                  id="circle-radius"
                  type="number"
                  placeholder="Enter radius"
                  value={circleRadius}
                  onChange={(e) => setCircleRadius(e.target.value)}
                />
              </div>
              <Button onClick={calculateCircle} className="w-full bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Circle Area
              </Button>
              {results.circle && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    Area: <span className="text-primary">{results.circle.toFixed(2)} sq ft</span>
                  </p>
                  <p className="text-sm text-muted-foreground">({(results.circle / 9).toFixed(2)} square yards)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triangle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Triangular Area</CardTitle>
              <CardDescription>Calculate area for triangular spaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="triangle-base">Base (feet)</Label>
                  <Input
                    id="triangle-base"
                    type="number"
                    placeholder="Enter base"
                    value={triangleBase}
                    onChange={(e) => setTriangleBase(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="triangle-height">Height (feet)</Label>
                  <Input
                    id="triangle-height"
                    type="number"
                    placeholder="Enter height"
                    value={triangleHeight}
                    onChange={(e) => setTriangleHeight(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={calculateTriangle} className="w-full bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Triangle Area
              </Button>
              {results.triangle && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    Area: <span className="text-primary">{results.triangle.toFixed(2)} sq ft</span>
                  </p>
                  <p className="text-sm text-muted-foreground">({(results.triangle / 9).toFixed(2)} square yards)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
