import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Thermometer, Droplets, Wind, Sun } from 'lucide-react'

interface CityWeather {
  cityId: number
  cityName: string
  temperature: number
  precipitation?: number
  windSpeed?: number
  cloudCover?: number
  forecast7d?: {}
}

export default function CitySelection() {
  const navigate = useNavigate()
  const [cities, setCities] = useState<CityWeather[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const selectedCityIds = JSON.parse(localStorage.getItem("selectedCities") || "[]");

    const fetchAllData = async () => {
      if (selectedCityIds.length === 0) return;
      try {
        setLoading(true);

        const res = await api.get("/weather/logs?limit=10000");
        const allLogs = res.data.data;
        console.log("All logs:", allLogs);

        const latestByCity = allLogs.reduce((acc: any, log: any) => {
          if (!acc[log.cityId] || new Date(log.createdAt) > new Date(acc[log.cityId].createdAt)) {
            acc[log.cityId] = log;
          }
          return acc;
        }, {});

        setCities(Object.values(latestByCity));
      } catch (err) {
        console.error("Error loading cities log:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []); 


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Weather forecast of selected cities</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-8 w-40" /></CardHeader>
                <CardContent><Skeleton className="h-32 w-full" /></CardContent>
              </Card>
            ))
          ) : (
            cities.map(city => (
              <Card
                key={city.cityId}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/city/${city.cityId}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {city.cityName}
                    {city.temperature > 30 ? <Sun className="text-orange-500" /> : <Thermometer className="text-blue-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-4xl font-bold">{city.temperature.toFixed(1)}°C</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      {(city.precipitation || 0).toFixed(1)} mm
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      {(city.windSpeed || 0).toFixed(0)} km/h
                    </div>
                  </div>
                  <Button variant="secondary" className="w-full">
                    View all details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}