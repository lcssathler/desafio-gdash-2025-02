import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Header from '@/components/Header'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Cloud, CloudRain, Sun, Thermometer, Wind, Download, LogOut } from 'lucide-react'

interface CityData {
  cityId: number
  cityName: string
  state: string
  temperature: number
  precipitation?: number
  cloudCover?: number
  windSpeed?: number
  weatherCode?: number
  createdAt: string
}

interface Insight {
  text: string
  type: 'warning' | 'info' | 'success'
}

export default function Dashboard() {
  const [logs, setLogs] = useState<CityData[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:3000/weather/logs?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLogs(res.data.data)
      generateInsights(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = async (data: CityData[]) => {
    const latest = data.slice(0, 5)
    const newInsights: Insight[] = []

    latest.forEach(city => {
      if (city.temperature > 35) {
        newInsights.push({ text: `Calor extremo em ${city.cityName}: ${city.temperature}°C`, type: 'warning' })
      } else if (city.temperature < 15) {
        newInsights.push({ text: `Frio em ${city.cityName}: ${city.temperature}°C`, type: 'info' })
      }
      if ((city.precipitation || 0) > 5) {
        newInsights.push({ text: `Chuva forte em ${city.cityName}`, type: 'warning' })
      }
    })

    try {
      const res = await axios.post('http://localhost:3000/ai/insights', { cities: latest })
      if (res.data.insights) {
        res.data.insights.forEach((i: string) => newInsights.push({ text: i, type: 'success' }))
      }
    } catch (err) { }

    setInsights(newInsights)
  }

  const exportCSV = () => {
    const headers = ['Cidade', 'Temperatura', 'Data']
    const rows = logs.map(l => [l.cityName, l.temperature, new Date(l.createdAt).toLocaleString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gdash-clima.csv'
    a.click()
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const latestByCity = logs.reduce((acc, log) => {
    if (!acc[log.cityId] || new Date(log.createdAt) > new Date(acc[log.cityId].createdAt)) {
      acc[log.cityId] = log
    }
    return acc
  }, {} as Record<number, CityData>)

  const chartData = Object.values(latestByCity).map(city => ({
    name: city.cityName.split(' ')[0],
    temp: city.temperature
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {insights.length > 0 && (
          <div className="mb-8 space-y-3">
            {insights.map((i, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                i.type === 'warning' ? 'bg-orange-50 border-orange-300 text-orange-800' :
                i.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' :
                'bg-blue-50 border-blue-300 text-blue-800'
              }`}>
                {i.text}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-24 w-full" /></CardContent>
              </Card>
            ))
          ) : (
            Object.values(latestByCity).map(city => (
              <Card key={city.cityId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{city.cityName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{city.state}</p>
                    </div>
                    {city.temperature > 30 ? <Sun className="w-8 h-8 text-orange-500" /> :
                     city.temperature < 20 ? <Cloud className="w-8 h-8 text-blue-500" /> :
                     <CloudRain className="w-8 h-8 text-gray-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{city.temperature.toFixed(1)}°C</div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rain</span>
                      <Badge variant="secondary">{(city.precipitation || 0).toFixed(1)} mm</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wind</span>
                      <Badge variant="secondary">{(city.windSpeed || 0).toFixed(0)} km/h</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current temperatures in celsius</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button size="lg" onClick={exportCSV}>
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </Button>
        </div>
      </main>
    </div>
  )
}