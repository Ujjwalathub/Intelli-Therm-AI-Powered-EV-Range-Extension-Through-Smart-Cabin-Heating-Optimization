"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Battery, Zap, Thermometer, Clock, Download } from "lucide-react"

interface AnalyticsData {
  energySavings: {
    daily: number
    weekly: number
    monthly: number
    total: number
  }
  rangeExtension: {
    daily: number
    weekly: number
    monthly: number
    total: number
  }
  optimizationEvents: {
    peakShaving: number
    compensation: number
    total: number
  }
  efficiency: {
    current: number
    baseline: number
    improvement: number
  }
}

// Generate sample analytics data
const generateAnalyticsData = (): AnalyticsData => ({
  energySavings: {
    daily: 2.3 + Math.random() * 0.5,
    weekly: 16.1 + Math.random() * 2,
    monthly: 68.4 + Math.random() * 8,
    total: 245.7 + Math.random() * 20,
  },
  rangeExtension: {
    daily: 9.2 + Math.random() * 2,
    weekly: 64.4 + Math.random() * 8,
    monthly: 273.6 + Math.random() * 30,
    total: 982.3 + Math.random() * 80,
  },
  optimizationEvents: {
    peakShaving: 47 + Math.floor(Math.random() * 10),
    compensation: 23 + Math.floor(Math.random() * 5),
    total: 70 + Math.floor(Math.random() * 15),
  },
  efficiency: {
    current: 4.2 + Math.random() * 0.3,
    baseline: 3.8 + Math.random() * 0.2,
    improvement: 10.5 + Math.random() * 2,
  },
})

// Generate time series data for charts
const generateTimeSeriesData = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      energySaved: 1.5 + Math.random() * 2,
      rangeExtended: 6 + Math.random() * 8,
      efficiency: 3.8 + Math.random() * 0.8,
      optimizationEvents: Math.floor(Math.random() * 15) + 5,
      heaterUsage: 15 + Math.random() * 10,
      ambientTemp: -5 + Math.random() * 15,
    })
  }

  return data
}

const generateHourlyData = () => {
  const data = []
  for (let hour = 0; hour < 24; hour++) {
    data.push({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      powerUsage: 12 + Math.random() * 8 + (hour >= 7 && hour <= 9 ? 5 : 0) + (hour >= 17 && hour <= 19 ? 4 : 0),
      heaterPower: 1.5 + Math.random() * 1.5 + (hour >= 6 && hour <= 8 ? 1 : 0),
      optimizationActive: Math.random() > 0.3 ? 1 : 0,
    })
  }
  return data
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(generateAnalyticsData())
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData(30))
  const [hourlyData, setHourlyData] = useState(generateHourlyData())
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly")

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(generateAnalyticsData())
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const pieData = [
    { name: "Peak Shaving", value: analyticsData.optimizationEvents.peakShaving, color: "#8b5cf6" },
    { name: "Compensation", value: analyticsData.optimizationEvents.compensation, color: "#06b6d4" },
    {
      name: "Normal Operation",
      value: 100 - analyticsData.optimizationEvents.total,
      color: "#64748b",
    },
  ]

  const exportData = () => {
    const dataToExport = {
      analytics: analyticsData,
      timeSeries: timeSeriesData,
      hourly: hourlyData,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `intelli-therm-analytics-${new Date().toISOString().split("T")[0]}.json`
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
          <h2 className="text-2xl font-bold text-foreground">Energy Analytics</h2>
          <p className="text-muted-foreground">Performance insights and optimization metrics</p>
        </div>
        <Button onClick={exportData} variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4 text-green-500" />
              Energy Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {analyticsData.energySavings[selectedPeriod].toFixed(1)} kWh
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />+{((analyticsData.energySavings[selectedPeriod] / 20) * 100).toFixed(1)}
              % vs baseline
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Battery className="w-4 h-4 text-blue-500" />
              Range Extended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              +{analyticsData.rangeExtension[selectedPeriod].toFixed(0)} km
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              {((analyticsData.rangeExtension[selectedPeriod] / 400) * 100).toFixed(1)}% range increase
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Thermometer className="w-4 h-4 text-orange-500" />
              Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.efficiency.current.toFixed(1)} km/kWh</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />+{analyticsData.efficiency.improvement.toFixed(1)}% improvement
            </div>
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
            <div className="text-2xl font-bold text-purple-400">{analyticsData.optimizationEvents.total}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{analyticsData.optimizationEvents.peakShaving} peak shaving</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        <div className="flex gap-1">
          {(["daily", "weekly", "monthly"] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="capitalize"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="daily">Daily Pattern</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Savings Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Energy Savings Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                        }
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
                        formatter={(value: number) => [`${value.toFixed(2)} kWh`, "Energy Saved"]}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="energySaved"
                        stroke="hsl(var(--chart-3))"
                        fill="hsl(var(--chart-3))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Range Extension Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-blue-500" />
                  Range Extension Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                        }
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
                        formatter={(value: number) => [`+${value.toFixed(1)} km`, "Range Extended"]}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="rangeExtended"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Daily Usage Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="hour"
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
                        `${value.toFixed(1)} ${name === "powerUsage" ? "kW" : "kW"}`,
                        name === "powerUsage" ? "Total Power" : "Heater Power",
                      ]}
                    />
                    <Bar dataKey="powerUsage" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="heaterPower" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Events Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Optimization Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--card-foreground))",
                        }}
                        formatter={(value: number) => [`${value}%`, "Percentage"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Optimization Events Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Optimization Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                        }
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
                        formatter={(value: number) => [`${value}`, "Events"]}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="optimizationEvents"
                        stroke="hsl(var(--chart-5))"
                        fill="hsl(var(--chart-5))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Efficiency Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })
                      }
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
                        `${value.toFixed(2)} km/kWh`,
                        name === "efficiency" ? "With Intelli-Therm" : "Baseline",
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="efficiency"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                      name="efficiency"
                    />
                    <Line
                      type="monotone"
                      data={timeSeriesData.map((d) => ({ ...d, baseline: d.efficiency * 0.9 }))}
                      dataKey="baseline"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="baseline"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
