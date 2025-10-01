"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Battery, Thermometer, Activity, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react"
import { VehicleMetrics } from "@/components/vehicle-metrics"
import { HeatingControl } from "@/components/heating-control"
import { EnergyChart } from "@/components/energy-chart"
import { PredictionDisplay } from "@/components/prediction-display"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

// Simulated real-time vehicle data
const generateVehicleData = () => ({
  speed: Math.random() * 80 + 20, // 20-100 km/h
  batteryLevel: Math.random() * 30 + 70, // 70-100%
  batteryVoltage: Math.random() * 10 + 350, // 350-360V
  batteryCurrent: Math.random() * 50 + 100, // 100-150A
  ambientTemp: Math.random() * 20 - 10, // -10 to 10°C
  cabinTemp: Math.random() * 5 + 20, // 20-25°C
  heaterPower: Math.random() * 2000 + 1000, // 1-3kW
  powertrainLoad: Math.random() * 5000 + 15000, // 15-20kW
  throttlePosition: Math.random() * 100, // 0-100%
  timestamp: new Date().toISOString(),
})

export function VehicleDashboard() {
  const [vehicleData, setVehicleData] = useState(generateVehicleData())
  const [isOptimizationActive, setIsOptimizationActive] = useState(true)
  const [energySaved, setEnergySaved] = useState(7.2)
  const [rangeExtension, setRangeExtension] = useState(28)
  const [activeSection, setActiveSection] = useState("overview")

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleData(generateVehicleData())

      // Simulate energy savings fluctuation
      setEnergySaved((prev) => Math.max(0, prev + (Math.random() - 0.5) * 0.5))
      setRangeExtension((prev) => Math.max(0, prev + (Math.random() - 0.5) * 2))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-400"
    if (value >= thresholds.warning) return "text-yellow-400"
    return "text-red-400"
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "analytics":
        return <AnalyticsDashboard />
      case "overview":
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Key Metrics */}
            <div className="space-y-6">
              {/* Battery Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Battery className="w-5 h-5 text-primary" />
                    Battery Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Charge Level</span>
                      <span className={getStatusColor(vehicleData.batteryLevel, { good: 80, warning: 50 })}>
                        {vehicleData.batteryLevel.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={vehicleData.batteryLevel} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Voltage</span>
                      <span className="font-medium">{vehicleData.batteryVoltage.toFixed(1)}V</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Current</span>
                      <span className="font-medium">{vehicleData.batteryCurrent.toFixed(1)}A</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Temperature Control */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Thermometer className="w-5 h-5 text-primary" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{vehicleData.ambientTemp.toFixed(1)}°C</div>
                      <div className="text-xs text-muted-foreground">Ambient</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{vehicleData.cabinTemp.toFixed(1)}°C</div>
                      <div className="text-xs text-muted-foreground">Cabin</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Heater Power</span>
                      <span className="font-medium">{(vehicleData.heaterPower / 1000).toFixed(1)}kW</span>
                    </div>
                    <Progress value={(vehicleData.heaterPower / 3000) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5 text-primary" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold text-primary">{energySaved.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Energy Saved</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold text-green-400">+{rangeExtension.toFixed(0)}km</div>
                      <div className="text-xs text-muted-foreground">Range Extended</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Charts and Predictions */}
            <div className="space-y-6">
              <EnergyChart vehicleData={vehicleData} />
              <PredictionDisplay vehicleData={vehicleData} isOptimizationActive={isOptimizationActive} />
            </div>

            {/* Right Column - Controls and Detailed Metrics */}
            <div className="space-y-6">
              <HeatingControl
                vehicleData={vehicleData}
                isOptimizationActive={isOptimizationActive}
                onOptimizationToggle={setIsOptimizationActive}
              />
              <VehicleMetrics vehicleData={vehicleData} />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {activeSection === "analytics" ? "Energy Analytics" : "Vehicle Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {activeSection === "analytics"
                ? "Performance insights and optimization metrics"
                : "Real-time monitoring and AI optimization"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={activeSection === "analytics" ? "default" : "outline"}
              onClick={() => setActiveSection(activeSection === "analytics" ? "overview" : "analytics")}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {activeSection === "analytics" ? "Dashboard" : "Analytics"}
            </Button>
            <Badge variant={isOptimizationActive ? "default" : "secondary"} className="gap-2">
              {isOptimizationActive ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {isOptimizationActive ? "Optimization Active" : "Manual Mode"}
            </Badge>
            <Button
              variant={isOptimizationActive ? "destructive" : "default"}
              onClick={() => setIsOptimizationActive(!isOptimizationActive)}
            >
              {isOptimizationActive ? "Disable AI" : "Enable AI"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">{renderActiveSection()}</div>
    </div>
  )
}
