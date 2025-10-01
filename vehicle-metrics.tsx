"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gauge, Zap, Wind, Thermometer } from "lucide-react"

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

interface VehicleMetricsProps {
  vehicleData: VehicleData
}

export function VehicleMetrics({ vehicleData }: VehicleMetricsProps) {
  const powertrainLoadKW = vehicleData.powertrainLoad / 1000
  const efficiency = ((vehicleData.speed / powertrainLoadKW) * 100).toFixed(1)

  const getThrottleStatus = (position: number) => {
    if (position < 20) return { label: "Idle", color: "bg-green-500" }
    if (position < 50) return { label: "Moderate", color: "bg-yellow-500" }
    if (position < 80) return { label: "High", color: "bg-orange-500" }
    return { label: "Maximum", color: "bg-red-500" }
  }

  const throttleStatus = getThrottleStatus(vehicleData.throttlePosition)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gauge className="w-5 h-5 text-primary" />
          Vehicle Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Speed and Efficiency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{vehicleData.speed.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">km/h</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{efficiency}</div>
            <div className="text-xs text-muted-foreground">km/kWh</div>
          </div>
        </div>

        {/* Powertrain Load */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Powertrain Load</span>
            </div>
            <span className="text-sm font-mono">{powertrainLoadKW.toFixed(1)} kW</span>
          </div>
          <Progress value={(powertrainLoadKW / 25) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 kW</span>
            <span>25 kW</span>
          </div>
        </div>

        {/* Throttle Position */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Throttle Position</span>
            </div>
            <Badge variant="outline" className="gap-1">
              <div className={`w-2 h-2 rounded-full ${throttleStatus.color}`} />
              {throttleStatus.label}
            </Badge>
          </div>
          <Progress value={vehicleData.throttlePosition} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{vehicleData.throttlePosition.toFixed(0)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Temperature Differential */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Temperature Differential</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Cabin - Ambient</span>
              <span className="text-lg font-bold text-orange-400">
                {(vehicleData.cabinTemp - vehicleData.ambientTemp).toFixed(1)}°C
              </span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Last Updated</div>
          <div className="text-xs font-mono text-foreground">
            {new Date(vehicleData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
