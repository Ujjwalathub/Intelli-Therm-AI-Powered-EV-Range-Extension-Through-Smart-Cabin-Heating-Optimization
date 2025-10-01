"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"

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

interface PredictionDisplayProps {
  vehicleData: VehicleData
  isOptimizationActive: boolean
}

interface Prediction {
  futureLoad: number
  confidence: number
  timeHorizon: number
  recommendation: string
  status: "normal" | "high_demand" | "optimization"
}

export function PredictionDisplay({ vehicleData, isOptimizationActive }: PredictionDisplayProps) {
  const [prediction, setPrediction] = useState<Prediction>({
    futureLoad: 0,
    confidence: 0,
    timeHorizon: 5,
    recommendation: "Monitoring...",
    status: "normal",
  })

  const [predictionHistory, setPredictionHistory] = useState<number[]>([])

  useEffect(() => {
    // Simulate ML model prediction based on current vehicle state
    const simulatePrediction = () => {
      const currentLoad = vehicleData.powertrainLoad / 1000 // Convert to kW
      const throttleInfluence = vehicleData.throttlePosition / 100
      const speedInfluence = vehicleData.speed / 100

      // Simulate future load prediction with some randomness and trends
      const baseLoad = currentLoad
      const throttleEffect = throttleInfluence * 5 // Up to 5kW additional load
      const speedEffect = speedInfluence * 3 // Up to 3kW additional load
      const randomVariation = (Math.random() - 0.5) * 4 // ±2kW random variation

      const predictedLoad = Math.max(10, baseLoad + throttleEffect + speedEffect + randomVariation)

      // Simulate confidence based on data consistency
      const confidence = Math.min(95, 70 + Math.random() * 25)

      // Determine status and recommendation
      const highPowerThreshold = 18 // kW
      let status: "normal" | "high_demand" | "optimization" = "normal"
      let recommendation = "Normal driving conditions detected"

      if (predictedLoad > highPowerThreshold) {
        status = "high_demand"
        recommendation = isOptimizationActive
          ? "High power demand predicted - reducing heater power by 15%"
          : "High power demand predicted - consider enabling optimization"
      } else if (isOptimizationActive && currentLoad > highPowerThreshold * 0.8) {
        status = "optimization"
        recommendation = "Moderate load detected - maintaining optimal heating balance"
      }

      return {
        futureLoad: predictedLoad,
        confidence,
        timeHorizon: 5,
        recommendation,
        status,
      }
    }

    const newPrediction = simulatePrediction()
    setPrediction(newPrediction)

    // Update prediction history for trend analysis
    setPredictionHistory((prev) => {
      const updated = [...prev, newPrediction.futureLoad]
      return updated.slice(-10) // Keep last 10 predictions
    })
  }, [vehicleData, isOptimizationActive])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "high_demand":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "optimization":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      default:
        return <Brain className="w-4 h-4 text-primary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high_demand":
        return "text-yellow-400"
      case "optimization":
        return "text-green-400"
      default:
        return "text-primary"
    }
  }

  const averagePrediction =
    predictionHistory.length > 0 ? predictionHistory.reduce((sum, val) => sum + val, 0) / predictionHistory.length : 0

  const trend =
    predictionHistory.length >= 2
      ? predictionHistory[predictionHistory.length - 1] - predictionHistory[predictionHistory.length - 2]
      : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            AI Predictions
          </CardTitle>
          <Badge variant={isOptimizationActive ? "default" : "secondary"}>
            {isOptimizationActive ? "Active" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Prediction */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">5-Second Forecast</span>
            </div>
            <span className={`text-lg font-bold ${getStatusColor(prediction.status)}`}>
              {prediction.futureLoad.toFixed(1)} kW
            </span>
          </div>

          <Progress value={(prediction.futureLoad / 25) * 100} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 kW</span>
            <span>Current: {(vehicleData.powertrainLoad / 1000).toFixed(1)} kW</span>
            <span>25 kW</span>
          </div>
        </div>

        {/* Confidence and Trend */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-primary">{prediction.confidence.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div
              className={`text-lg font-bold ${trend > 0 ? "text-red-400" : trend < 0 ? "text-green-400" : "text-muted-foreground"}`}
            >
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Trend (kW)</div>
          </div>
        </div>

        {/* Status and Recommendation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(prediction.status)}
            <span className="text-sm font-medium">System Status</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-foreground leading-relaxed">{prediction.recommendation}</p>
          </div>
        </div>

        {/* Model Performance */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Avg Prediction</span>
            </div>
            <span className="font-medium">{averagePrediction.toFixed(1)} kW</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
