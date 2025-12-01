import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Sun, CloudRain, Wind, Thermometer } from 'lucide-react'
import Header from '@/components/Header'
import ForecastChart from '@/components/ForecastChart'

interface Log {
  cityName: string
  state: string
  temperature: number
  apparentTemperature: number
  precipitation?: number
  cloudCover: number
  windSpeed: number
  createdAt: string
  forecast7d?: Array<{
    date: string
    tempMean: number
    tempMax: number
    tempMin: number
  }>
}

export default function CityDetail() {
  const { cityId } = useParams()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<Log[]>([])
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/weather/logs?cityId=${cityId}&limit=50`)
        const logsData = res.data.data || []
        setLogs(logsData)

        const aiRes = await api.get(`/weather/insights/grok/${cityId}`)
        setInsight(aiRes.data.insight || "Stable weather conditions.")
      } catch (err) {
        console.error("Error get insights:", err)
        setInsight("Iansight unavailable.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [cityId])

  const latestLog = logs[0]

  if (loading || !latestLog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Header />
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{latestLog.cityName} - {latestLog.state}</h1>
            <p className="text-gray-600">Weather Forecast</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card><CardContent className="pt-6 text-center"><Thermometer className="w-10 h-10 mx-auto mb-2 text-orange-500" /><p className="text-3xl font-bold">{latestLog.temperature.toFixed(1)}°C</p><p className="text-sm text-gray-600">Apparent Temperature {latestLog.apparentTemperature.toFixed(1)}°C</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><CloudRain className="w-10 h-10 mx-auto mb-2 text-gray-500" /><p className="text-3xl font-bold">{latestLog.cloudCover}%</p><p className="text-sm text-gray-600">Clouds</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Wind className="w-10 h-10 mx-auto mb-2 text-blue-500" /><p className="text-3xl font-bold">{latestLog.windSpeed.toFixed(1)}</p><p className="text-sm text-gray-600">km/h</p></CardContent></Card>
        </div>

        {}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Sun className="w-8 h-8 text-yellow-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg leading-relaxed bg-white/70 p-8 rounded-xl italic text-purple-900">
              "{insight}"
            </div>
          </CardContent>
        </Card>

        {}
        {latestLog.forecast7d && latestLog.forecast7d.length > 0 && (
          <ForecastChart forecast7d={latestLog.forecast7d} />
        )}
      </main>
    </div>
  )
}