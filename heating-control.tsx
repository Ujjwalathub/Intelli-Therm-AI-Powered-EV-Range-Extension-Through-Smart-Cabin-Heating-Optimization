"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Thermometer, Settings, Brain, AlertTriangle, CheckCircle } from "lucide-react"

interface VehicleData {
  speed: number
  batteryLevel: number
  batteryVoltage: number
  batteryCurrent: number
  ambientTemp: number
  cabinTemp: number
  heaterPower: number
  powertrainLoad: number
  throttlePosition: number
  timestamp: string
}

interface HeatingControlProps {
  vehicleData: VehicleData
  isOptimizationActive: boolean
  onOptimizationToggle: (active: boolean) => void
}

interface OptimizationSettings {
  aggressiveness: number // 0-100, how much to reduce heating during high power events
  comfortPriority: number // 0-100, balance between efficiency and comfort
  temperatureThreshold: number // Minimum cabin temperature to maintain
  powerThreshold: number // kW threshold for high power events
}

export function HeatingControl({ vehicleData, isOptimizationActive, onOptimizationToggle }: HeatingControlProps) {
  const [manualHeaterPower, setManualHeaterPower] = useState([2000])
  const [targetCabinTemp, setTargetCabinTemp] = useState([22])
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [optimizationSettings, setOptimizationSettings] = useState<OptimizationSettings>({
    aggressiveness: 15, // 15% reduction during high power events
    comfortPriority: 70, // 70% comfort priority
    temperatureThreshold: 18, // Minimum 18°C
    powerThreshold: 18, // 18kW threshold
  })

  const [currentOptimizedPower, setCurrentOptimizedPower] = useState(vehicleData.heaterPower)
  const [optimizationStatus, setOptimizationStatus] = useState<"normal" | "reducing" | "compensating">("normal")

  useEffect(() => {
    if (isOptimizationActive) {
      // Simulate Intelli-Therm algorithm
      const powertrainLoadKW = vehicleData.powertrainLoad / 1000
      const baseHeaterPower = vehicleData.heaterPower

      let optimizedPower = baseHeaterPower
      let status: "normal" | "reducing" | "compensating" = "normal"

      // High power event detection
      if (powertrainLoadKW > optimizationSettings.powerThreshold) {
        // Reduce heater power based on aggressiveness setting
        const reductionFactor = 1 - optimizationSettings.aggressiveness / 100
        optimizedPower = baseHeaterPower * reductionFactor

        // Check comfort constraints
        const tempDiff = vehicleData.cabinTemp - optimizationSettings.temperatureThreshold
        if (tempDiff < 2) {
          // If cabin temp is close to minimum, reduce aggressiveness
          optimizedPower = baseHeaterPower * (1 - optimizationSettings.aggressiveness / 200)
        }

        status = "reducing"
      } else if (powertrainLoadKW < optimizationSettings.powerThreshold * 0.7) {
        // Low power event - can compensate by increasing heating slightly
        const comfortFactor = optimizationSettings.comfortPriority / 100
        optimizedPower = baseHeaterPower * (1 + 0.1 * comfortFactor)
        status = "compensating"
      }

      setCurrentOptimizedPower(optimizedPower)
      setOptimizationStatus(status)
    } else {
      setCurrentOptimizedPower(manualHeaterPower[0])
      setOptimizationStatus("normal")
    }
  }, [vehicleData, isOptimizationActive, optimizationSettings, manualHeaterPower])

  const getStatusInfo = () => {
    switch (optimizationStatus) {
      case "reducing":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
          label: "Peak Shaving",
          description: "Reducing heater power during high power demand",
          color: "text-yellow-400",
        }
      case "compensating":
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-400" />,
          label: "Compensating",
          description: "Increasing heating during low power periods",
          color: "text-green-400",
        }
      default:
        return {
          icon: <Brain className="w-4 h-4 text-primary" />,
          label: "Normal",
          description: "Maintaining optimal heating balance",
          color: "text-primary",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const energySavingRate = ((vehicleData.heaterPower - currentOptimizedPower) / vehicleData.heaterPower) * 100
  const powerEfficiency = (vehicleData.speed / (vehicleData.powertrainLoad / 1000)) * 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Thermometer className="w-5 h-5 text-primary" />
            Heating Control
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isOptimizationActive ? "default" : "secondary"} className="gap-1">
              {statusInfo.icon}
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Optimization Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="font-medium">AI Optimization</span>
            </div>
            <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
          </div>
          <Switch checked={isOptimizationActive} onCheckedChange={onOptimizationToggle} />
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-primary">{(currentOptimizedPower / 1000).toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Current Power (kW)</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className={`text-lg font-bold ${energySavingRate > 0 ? "text-green-400" : "text-muted-foreground"}`}>
              {energySavingRate > 0 ? "-" : ""}
              {Math.abs(energySavingRate).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Energy Change</div>
          </div>
        </div>

        {/* Manual Controls (when AI is disabled) */}
        {!isOptimizationActive && (
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Manual Control</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Heater Power</span>
                  <span className="font-medium">{(manualHeaterPower[0] / 1000).toFixed(1)} kW</span>
                </div>
                <Slider
                  value={manualHeaterPower}
                  onValueChange={setManualHeaterPower}
                  max={3000}
                  min={500}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.5 kW</span>
                  <span>3.0 kW</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Target Temperature</span>
                  <span className="font-medium">{targetCabinTemp[0]}°C</span>
                </div>
                <Slider
                  value={targetCabinTemp}
                  onValueChange={setTargetCabinTemp}
                  max={28}
                  min={16}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>16°C</span>
                  <span>28°C</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced AI Settings */}
        {isOptimizationActive && (
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvancedSettings ? "Hide" : "Show"} Advanced Settings
            </Button>

            {showAdvancedSettings && (
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Optimization Aggressiveness</span>
                    <span className="font-medium">{optimizationSettings.aggressiveness}%</span>
                  </div>
                  <Slider
                    value={[optimizationSettings.aggressiveness]}
                    onValueChange={(value) =>
                      setOptimizationSettings((prev) => ({ ...prev, aggressiveness: value[0] }))
                    }
                    max={30}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How much to reduce heating during high power events
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Comfort Priority</span>
                    <span className="font-medium">{optimizationSettings.comfortPriority}%</span>
                  </div>
                  <Slider
                    value={[optimizationSettings.comfortPriority]}
                    onValueChange={(value) =>
                      setOptimizationSettings((prev) => ({ ...prev, comfortPriority: value[0] }))
                    }
                    max={100}
                    min={30}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Balance between efficiency and comfort</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Min Cabin Temperature</span>
                    <span className="font-medium">{optimizationSettings.temperatureThreshold}°C</span>
                  </div>
                  <Slider
                    value={[optimizationSettings.temperatureThreshold]}
                    onValueChange={(value) =>
                      setOptimizationSettings((prev) => ({ ...prev, temperatureThreshold: value[0] }))
                    }
                    max={25}
                    min={15}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum temperature to maintain</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">High Power Threshold</span>
                    <span className="font-medium">{optimizationSettings.powerThreshold} kW</span>
                  </div>
                  <Slider
                    value={[optimizationSettings.powerThreshold]}
                    onValueChange={(value) =>
                      setOptimizationSettings((prev) => ({ ...prev, powerThreshold: value[0] }))
                    }
                    max={25}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Power level that triggers optimization</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Indicators */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Power Efficiency</span>
              <span className="font-medium">{powerEfficiency.toFixed(1)} km/kWh</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">System Load</span>
              <span className="font-medium">{((vehicleData.powertrainLoad / 1000 / 25) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
