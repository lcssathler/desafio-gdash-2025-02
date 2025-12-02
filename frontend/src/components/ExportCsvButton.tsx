import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { CityWeather } from '@/components/interfaces/CityWeather'

interface Props {
  cities: CityWeather[]
}

export default function ExportCsvButton({ cities }: Props) {
  const handleExport = () => {
    const headers = ['City', 'Temperature', 'Data']
    const rows = cities.map(c => [c.cityName, c.temperature.toString(), new Date(c.createdAt).toLocaleString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'weather-data.csv'
    a.click()
  }

  return (
    <Button size="lg" onClick={handleExport}>
      <Download className="w-5 h-5 mr-2" />
      Export CSV
    </Button>
  )
}
