"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

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

interface EnergyChartProps {
  vehicleData: VehicleData
}

interface DataPoint {
  time: string
  powertrainLoad: number
  heaterPower: number
  optimizedHeaterPower: number
  energySaved: number
  timestamp: number
}

export function EnergyChart({ vehicleData }: EnergyChartProps) {
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [totalEnergySaved, setTotalEnergySaved] = useState(0)

  useEffect(() => {
    const now = Date.now()
    const timeStr = new Date(now).toLocaleTimeString([], {
      hour12: false,
      minute: "2-digit",
      second: "2-digit",
    })

    // Simulate Intelli-Therm optimization
    const baseHeaterPower = vehicleData.heaterPower
    const powertrainLoadKW = vehicleData.powertrainLoad / 1000

    // High power threshold (90th percentile simulation)
    const highPowerThreshold = 18 // kW

    // Apply optimization logic
    let optimizedHeaterPower = baseHeaterPower
    if (powertrainLoadKW > highPowerThreshold) {
      // Reduce heater power by 15% during high power demand
      optimizedHeaterPower = baseHeaterPower * 0.85
    }

    const energySaved = baseHeaterPower - optimizedHeaterPower

    const newDataPoint: DataPoint = {
      time: timeStr,
      powertrainLoad: powertrainLoadKW,
      heaterPower: baseHeaterPower / 1000, // Convert to kW
      optimizedHeaterPower: optimizedHeaterPower / 1000, // Convert to kW
      energySaved: energySaved / 1000, // Convert to kW
      timestamp: now,
    }

    setChartData((prev) => {
      const updated = [...prev, newDataPoint]
      // Keep only last 20 data points for performance
      return updated.slice(-20)
    })

    // Update total energy saved
    setTotalEnergySaved((prev) => prev + energySaved / 1000)
  }, [vehicleData])

  const averageEnergySaved =
    chartData.length > 0 ? chartData.reduce((sum, point) => sum + point.energySaved, 0) / chartData.length : 0

  const isCurrentlyOptimizing = chartData.length > 0 && chartData[chartData.length - 1].energySaved > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-primary" />
            Energy Optimization
          </CardTitle>
          <Badge variant={isCurrentlyOptimizing ? "default" : "secondary"} className="gap-1">
            {isCurrentlyOptimizing ? (
              <>
                <TrendingDown className="w-3 h-3" />
                Optimizing
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3" />
                Normal
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-green-400">{averageEnergySaved.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Avg Saved (kW)</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-blue-400">{totalEnergySaved.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Total (kWh)</div>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-primary">
              {chartData.length > 0 ? chartData[chartData.length - 1].powertrainLoad.toFixed(1) : "0.0"}
            </div>
            <div className="text-xs text-muted-foreground">Load (kW)</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
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
                  `${value.toFixed(2)} kW`,
                  name === "powertrainLoad"
                    ? "Powertrain Load"
                    : name === "heaterPower"
                      ? "Original Heater"
                      : name === "optimizedHeaterPower"
                        ? "Optimized Heater"
                        : "Energy Saved",
                ]}
              />

              {/* Powertrain Load Area */}
              <Area
                type="monotone"
                dataKey="powertrainLoad"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.3}
              />

              {/* Heater Power Lines */}
              <Line
                type="monotone"
                dataKey="heaterPower"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="optimizedHeaterPower"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-1 rounded-sm opacity-50" />
            <span className="text-muted-foreground">Powertrain Load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-chart-2 rounded-sm" style={{ borderStyle: "dashed" }} />
            <span className="text-muted-foreground">Original Heater</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-chart-3 rounded-sm" />
            <span className="text-muted-foreground">Optimized Heater</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
