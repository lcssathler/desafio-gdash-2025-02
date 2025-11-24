import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Sun, CloudRain } from 'lucide-react'

interface Log {
  temperature: number
  precipitation?: number
  createdAt: string
}

export default function CityDetail() {
  const { cityId } = useParams()
  const navigate = useNavigate()
  const [logs, setLogs] = useState<Log[]>([])
  const [cityName, setCityName] = useState('')
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/weather/logs/city/${cityId}`)
        const data = res.data.data
        if (data.length > 0) {
          setCityName(data[0].cityName)
          setLogs(data.slice(0, 50))

          const aiRes = await api.post('/ai/insights', {
            cityId: Number(cityId),
            cityName: data[0].cityName,
            logs: data.slice(0, 10)
          })
          setInsight(aiRes.data.insight || "Condições climáticas estáveis e favoráveis para geração solar.")
        }
      } catch (err) {
        setInsight("Não foi possível gerar o insight no momento.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [cityId])

  const chartData = logs.map(log => ({
    date: new Date(log.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    temp: log.temperature
  })).reverse()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{cityName} - Detalhes Climáticos</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Sun className="w-8 h-8 text-yellow-500" />
                Análise Completa com Inteligência Artificial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg leading-relaxed bg-muted p-6 rounded-lg">
                {insight}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Temperatura (últimas 50 coletas)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}