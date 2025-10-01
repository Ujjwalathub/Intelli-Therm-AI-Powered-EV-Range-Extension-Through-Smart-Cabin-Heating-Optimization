"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Play, Pause, RotateCcw, Download, MapPin, Clock, Thermometer, Zap } from "lucide-react"

interface TripData {
  time: number
  speed: number
  throttlePosition: number
  powertrainLoad: number
  heaterPower: number
  optimizedHeaterPower: number
  batteryLevel: number
  ambientTemp: number
  cabinTemp: number
  energySaved: number
  cumulativeEnergySaved: number
}

interface SimulationResults {
  totalEnergyBaseline: number
  totalEnergyOptimized: number
  energySaved: number
  energySavedPercent: number
  rangeExtension: number
  optimizationEvents: number
  averageEfficiency: number
  tripDuration: number
}

// Predefined trip scenarios
const tripScenarios = [
  {
    id: "city_winter",
    name: "City Driving - Winter",
    description: "Urban commute in -10°C conditions",
    duration: 1800, // 30 minutes
    ambientTemp: -10,
    profile: "city",
  },
  {
    id: "highway_cold",
    name: "Highway - Cold Weather",
    description: "Highway driving in 0°C conditions",
    duration: 3600, // 60 minutes
    ambientTemp: 0,
    profile: "highway",
  },
  {
    id: "mixed_mild",
    name: "Mixed Driving - Mild Cold",
    description: "City and highway mix in 5°C",
    duration: 2700, // 45 minutes
    ambientTemp: 5,
    profile: "mixed",
  },
  {
    id: "custom",
    name: "Custom Trip",
    description: "Configure your own trip parameters",
    duration: 1800,
    ambientTemp: -5,
    profile: "mixed",
  },
]

// Generate realistic trip data based on scenario
const generateTripData = (scenario: (typeof tripScenarios)[0], optimizationEnabled: boolean): TripData[] => {
  const data: TripData[] = []
  const timeStep = 5 // 5 second intervals
  const totalPoints = scenario.duration / timeStep

  let batteryLevel = 85 + Math.random() * 10 // Start with 85-95%
  let cabinTemp = 20 + Math.random() * 3 // Start with comfortable temp
  let cumulativeEnergySaved = 0

  for (let i = 0; i < totalPoints; i++) {
    const time = i * timeStep
    const progress = i / totalPoints

    // Generate speed profile based on trip type
    let speed = 0
    switch (scenario.profile) {
      case "city":
        speed = 20 + 30 * Math.sin(progress * Math.PI * 4) + Math.random() * 10
        speed = Math.max(0, Math.min(60, speed))
        break
      case "highway":
        speed = 80 + 20 * Math.sin(progress * Math.PI * 2) + Math.random() * 5
        speed = Math.max(60, Math.min(120, speed))
        break
      case "mixed":
        if (progress < 0.3 || progress > 0.7) {
          // City portions
          speed = 25 + 25 * Math.sin(progress * Math.PI * 6) + Math.random() * 8
          speed = Math.max(0, Math.min(50, speed))
        } else {
          // Highway portion
          speed = 90 + 15 * Math.sin(progress * Math.PI * 3) + Math.random() * 5
          speed = Math.max(70, Math.min(110, speed))
        }
        break
    }

    // Calculate throttle position based on speed changes
    const prevSpeed = i > 0 ? data[i - 1].speed : speed
    const speedChange = speed - prevSpeed
    const throttlePosition = Math.max(0, Math.min(100, 30 + speedChange * 5 + Math.random() * 20))

    // Calculate powertrain load based on speed and throttle
    const baseLoad = (speed / 100) * 15 + (throttlePosition / 100) * 8 // 15-23 kW range
    const powertrainLoad = Math.max(8, baseLoad + Math.random() * 3)

    // Calculate baseline heater power based on ambient temperature and cabin temp difference
    const tempDiff = Math.max(0, 22 - scenario.ambientTemp) // Target 22°C
    const baseHeaterPower = Math.min(3000, 800 + tempDiff * 150 + Math.random() * 200)

    // Apply Intelli-Therm optimization
    let optimizedHeaterPower = baseHeaterPower
    let energySaved = 0

    if (optimizationEnabled) {
      const highPowerThreshold = 18 // kW
      if (powertrainLoad > highPowerThreshold) {
        // Peak shaving - reduce heater power by 15%
        optimizedHeaterPower = baseHeaterPower * 0.85
        energySaved = baseHeaterPower - optimizedHeaterPower
      } else if (powertrainLoad < highPowerThreshold * 0.7) {
        // Low power - can increase heating slightly for comfort
        optimizedHeaterPower = Math.min(baseHeaterPower * 1.1, 3000)
        energySaved = baseHeaterPower - optimizedHeaterPower // Negative = using more power
      }
    }

    // Update cumulative energy saved
    cumulativeEnergySaved += energySaved * (timeStep / 3600) // Convert to kWh

    // Update battery level (simplified)
    const totalPowerConsumption = powertrainLoad + optimizedHeaterPower / 1000
    batteryLevel -= (totalPowerConsumption * timeStep) / (75 * 3600) // Assuming 75kWh battery

    // Update cabin temperature (simplified thermal model)
    const heatingEffect = (optimizedHeaterPower / 2000) * 0.5 // Heating rate
    const coolingEffect = Math.max(0, (scenario.ambientTemp - cabinTemp) * 0.02) // Heat loss
    cabinTemp += heatingEffect + coolingEffect

    data.push({
      time,
      speed: Math.round(speed * 10) / 10,
      throttlePosition: Math.round(throttlePosition * 10) / 10,
      powertrainLoad: Math.round(powertrainLoad * 10) / 10,
      heaterPower: Math.round(baseHeaterPower),
      optimizedHeaterPower: Math.round(optimizedHeaterPower),
      batteryLevel: Math.max(0, Math.round(batteryLevel * 10) / 10),
      ambientTemp: scenario.ambientTemp,
      cabinTemp: Math.round(cabinTemp * 10) / 10,
      energySaved: Math.round(energySaved),
      cumulativeEnergySaved: Math.round(cumulativeEnergySaved * 1000) / 1000,
    })
  }

  return data
}

// Calculate simulation results
const calculateResults = (baselineData: TripData[], optimizedData: TripData[]): SimulationResults => {
  const timeStep = 5 / 3600 // 5 seconds in hours

  const totalEnergyBaseline = baselineData.reduce((sum, point) => sum + (point.heaterPower / 1000) * timeStep, 0)
  const totalEnergyOptimized = optimizedData.reduce(
    (sum, point) => sum + (point.optimizedHeaterPower / 1000) * timeStep,
    0,
  )

  const energySaved = totalEnergyBaseline - totalEnergyOptimized
  const energySavedPercent = (energySaved / totalEnergyBaseline) * 100

  // Estimate range extension (simplified)
  const rangeExtension = (energySaved / 0.2) * 1.6 // Assuming 0.2 kWh/km efficiency, 1.6x multiplier for heating impact

  // Count optimization events
  const optimizationEvents = optimizedData.filter(
    (point, i) => Math.abs(point.heaterPower - point.optimizedHeaterPower) > 50,
  ).length

  // Calculate average efficiency
  const avgSpeed = baselineData.reduce((sum, point) => sum + point.speed, 0) / baselineData.length
  const avgPowerConsumption = baselineData.reduce((sum, point) => sum + point.powertrainLoad, 0) / baselineData.length
  const averageEfficiency = avgSpeed / avgPowerConsumption

  return {
    totalEnergyBaseline,
    totalEnergyOptimized,
    energySaved,
    energySavedPercent,
    rangeExtension,
    optimizationEvents,
    averageEfficiency,
    tripDuration: baselineData.length * 5, // seconds
  }
}

export function TripSimulation() {
  const [selectedScenario, setSelectedScenario] = useState(tripScenarios[0])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [baselineData, setBaselineData] = useState<TripData[]>([])
  const [optimizedData, setOptimizedData] = useState<TripData[]>([])
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const runSimulation = async () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    setResults(null)

    // Simulate progressive data generation
    const totalSteps = 20
    for (let step = 0; step <= totalSteps; step++) {
      setSimulationProgress((step / totalSteps) * 100)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Generate trip data
    const baseline = generateTripData(selectedScenario, false)
    const optimized = generateTripData(selectedScenario, true)

    setBaselineData(baseline)
    setOptimizedData(optimized)

    // Calculate results
    const simulationResults = calculateResults(baseline, optimized)
    setResults(simulationResults)

    setIsSimulating(false)
    setShowComparison(true)
  }

  const resetSimulation = () => {
    setIsSimulating(false)
    setSimulationProgress(0)
    setBaselineData([])
    setOptimizedData([])
    setResults(null)
    setShowComparison(false)
  }

  const exportResults = () => {
    if (!results) return

    const exportData = {
      scenario: selectedScenario,
      results,
      baselineData,
      optimizedData,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `intelli-therm-simulation-${selectedScenario.id}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trip Simulation</h2>
          <p className="text-muted-foreground">Test Intelli-Therm performance across different driving scenarios</p>
        </div>
        {results && (
          <Button onClick={exportResults} variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export Results
          </Button>
        )}
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Trip Scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tripScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-colors ${
                  selectedScenario.id === scenario.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{scenario.name}</h3>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(scenario.duration / 60)}min
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        {scenario.ambientTemp}°C
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={runSimulation} disabled={isSimulating} className="gap-2">
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSimulating ? "Simulating..." : "Run Simulation"}
            </Button>
            <Button onClick={resetSimulation} variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {isSimulating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Simulation Progress</span>
                <span className="font-medium">{simulationProgress.toFixed(0)}%</span>
              </div>
              <Progress value={simulationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4 text-green-500" />
                Energy Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{results.energySaved.toFixed(2)} kWh</div>
              <div className="text-xs text-muted-foreground">{results.energySavedPercent.toFixed(1)}% reduction</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                Range Extension
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">+{results.rangeExtension.toFixed(1)} km</div>
              <div className="text-xs text-muted-foreground">Additional range gained</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-purple-500" />
                Optimization Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{results.optimizationEvents}</div>
              <div className="text-xs text-muted-foreground">Peak shaving events</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4 text-orange-500" />
                Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{results.averageEfficiency.toFixed(1)} km/kWh</div>
              <div className="text-xs text-muted-foreground">Average efficiency</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparison Charts */}
      {showComparison && baselineData.length > 0 && optimizedData.length > 0 && (
        <div className="space-y-6">
          {/* Power Consumption Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Power Consumption Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="time"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--card-foreground))",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value.toFixed(1)} ${name.includes("heater") ? "W" : "kW"}`,
                        name === "heaterPower"
                          ? "Baseline Heater"
                          : name === "optimizedHeaterPower"
                            ? "Optimized Heater"
                            : "Powertrain Load",
                      ]}
                      labelFormatter={(value) =>
                        `Time: ${Math.floor(Number(value) / 60)}:${(Number(value) % 60).toString().padStart(2, "0")}`
                      }
                    />
                    <ReferenceLine y={18} stroke="hsl(var(--destructive))" strokeDasharray="5 5" />

                    {/* Powertrain Load */}
                    <Line
                      data={baselineData}
                      type="monotone"
                      dataKey="powertrainLoad"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                      name="powertrainLoad"
                    />

                    {/* Baseline Heater Power */}
                    <Line
                      data={baselineData}
                      type="monotone"
                      dataKey="heaterPower"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="heaterPower"
                    />

                    {/* Optimized Heater Power */}
                    <Line
                      data={optimizedData}
                      type="monotone"
                      dataKey="optimizedHeaterPower"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                      name="optimizedHeaterPower"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-chart-1 rounded-sm" />
                  <span className="text-muted-foreground">Powertrain Load</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-chart-2 rounded-sm" style={{ borderStyle: "dashed" }} />
                  <span className="text-muted-foreground">Baseline Heater</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-chart-3 rounded-sm" />
                  <span className="text-muted-foreground">Optimized Heater</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-destructive rounded-sm" style={{ borderStyle: "dashed" }} />
                  <span className="text-muted-foreground">High Power Threshold</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cumulative Energy Savings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Cumulative Energy Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={optimizedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="time"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, "0")}`}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--card-foreground))",
                      }}
                      formatter={(value: number) => [`${value.toFixed(3)} kWh`, "Energy Saved"]}
                      labelFormatter={(value) =>
                        `Time: ${Math.floor(Number(value) / 60)}:${(Number(value) % 60).toString().padStart(2, "0")}`
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeEnergySaved"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
