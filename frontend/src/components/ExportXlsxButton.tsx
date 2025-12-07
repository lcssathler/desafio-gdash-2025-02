import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { CityWeather } from './interfaces/CityWeather'

interface ExportXlsxButtonProps {
  cities: CityWeather[]
}

export default function ExportXlsxButton({ cities }: ExportXlsxButtonProps) {
  const exportToXlsx = () => {
    if (cities.length === 0) {
      alert('None city to export.')
      return
    }

    const dataToExport = cities.map(city => ({
      "City": city.cityName,
      "State": city.state,
      "Temperature": `${city.temperature.toFixed(1)} °C`,
      'Apparent temperature': `${city.apparentTemperature.toFixed(1)} °C`,
      "Precipitation": `${city.precipitation?.toFixed(1)} mm`,
      'Wind speed': `${city.windSpeed?.toFixed(0)} km/h`,
      'Clouds (%)': `${city.cloudCover}%`,
      "Latitude": city.latitude.toFixed(4),
      "Longitude": city.longitude.toFixed(4),
      'Last update': new Date(city.createdAt).toLocaleString('pt-BR'),
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cidades Monitoradas')

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 18 },
      { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 22 }
    ]

    const fileName = `weather-forecast-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  return (
    <Button onClick={exportToXlsx} size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
      <Download className="w-5 h-5" />
      Export Excel (.xlsx)
    </Button>
  )
}