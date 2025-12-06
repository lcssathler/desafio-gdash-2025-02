import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Thermometer, Droplets, Wind, Sun, Plus } from 'lucide-react'
import Header from '@/components/Header'
import type { CityWeather } from '@/components/interfaces/CityWeather'
import CityChart from '@/components/CityChart'
import ExportCsvButton from '@/components/ExportCsvButton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function CitySelection() {
  const navigate = useNavigate()
  const [cities, setCities] = useState<CityWeather[]>([])
  const [loading, setLoading] = useState(true)
  const [cityToDelete, setCityToDelete] = useState<{ _id: string; cityId: number } | null>(null)

 const deleteCity = async ({ _id, cityId }: { _id: string; cityId: number }) => {
  try {
    await api.delete(`/weather/log/delete/${_id}`)
    setCities(prev => prev.filter(c => c._id !== _id))

    const saved = JSON.parse(localStorage.getItem("selectedCities") || "[]")
    const updated = saved.filter((id: number) => id !== cityId)
    localStorage.setItem("selectedCities", JSON.stringify(updated))

    toast.success("City deleted successfully")
  } catch {
    toast.error("Error deleting city")
  }
}



  useEffect(() => {
    const selectedCityIds = JSON.parse(localStorage.getItem("selectedCities") || "[]")
    const fetchAllData = async () => {
      if (selectedCityIds.length === 0) return
      try {
        setLoading(true)
        const res = await api.get("/weather/logs?limit=10000")
        const allLogs = res.data.data
        const latestByCity = allLogs.reduce((acc: any, log: any) => {
          if (!acc[log.cityId] || new Date(log.createdAt) > new Date(acc[log.cityId].createdAt)) {
            acc[log.cityId] = log
          }
          return acc
        }, {})
        setCities(
          Object.values(latestByCity).map((log: any) => ({
            cityId: log.cityId,
            cityName: log.cityName,
            temperature: log.temperature,
            precipitation: log.precipitation,
            windSpeed: log.windSpeed,
            cloudCover: log.cloudCover,
            apparentTemperature: log.apparentTemperature ?? log.temperature,
            createdAt: log.createdAt,
            forecast7d: log.forecast7d ?? [],
            latitude: log.latitude,
            longitude: log.longitude,
            source: log.source ?? "unknown",
            state: log.state ?? "",
            time: log.time ?? log.createdAt,
            updatedAt: log.updatedAt ?? log.createdAt,
            weatherCode: log.weatherCode ?? 0,
            __v: log.__v,
            _id: log._id
          }))
        )
      } catch {
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Selected Cities Weather</h2>
          <Button onClick={() => navigate('/home')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add More Cities
          </Button>
        </div>

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
              <AlertDialog key={city.cityId}>
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow hover:transform hover:-translate-y-1"
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

                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCityToDelete({ _id: city._id!, cityId: city.cityId })
                        }}
                      >
                        Delete city
                      </Button>
                    </AlertDialogTrigger>
                  </CardContent>
                </Card>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete city?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this city?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (cityToDelete) deleteCity(cityToDelete)
                      }}
                    >
                      Confirm delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))
          )}
        </div>

        <div className="mt-8">
          <CityChart cities={cities} />
        </div>

        <div className="flex justify-center mt-8">
          <ExportCsvButton cities={cities} />
        </div>
      </main>
    </div>
  )
}
