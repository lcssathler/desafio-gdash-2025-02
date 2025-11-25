import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCities } from '@/hooks/useCities'
import { Sun, MapPin } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { states, getCitiesByState, loading } = useCities()
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedCities, setSelectedCities] = useState<number[]>([])

  const cities = selectedState ? getCitiesByState(selectedState) : []

  const handleCityToggle = (cityId: number) => {
    setSelectedCities(prev =>
      prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    )
  }

  const handleContinue = async () => {
    if (selectedCities.length > 0) {
      localStorage.setItem('selectedCities', JSON.stringify(selectedCities))
      
      await fetch('http://localhost:3000/weather/selected-cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ citiesId: selectedCities })
      })

      navigate('/cities')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sun className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl">Weather Forecast</CardTitle>
          <p className="text-muted-foreground mt-2">Select cities to view its weather</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading states...</div>
                  ) : (
                    states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div>
                <Label>Selected cities: {selectedCities.length}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 max-h-96 overflow-y-auto p-4 border rounded-lg">
                  {cities.map(city => (
                    <div key={city.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`city-${city.id}`}
                        checked={selectedCities.includes(city.id)}
                        onCheckedChange={() => handleCityToggle(city.id)}
                      />
                      <label htmlFor={`city-${city.id}`} className="text-sm cursor-pointer">
                        {city.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={selectedCities.length === 0}
          >
            <MapPin className="w-5 h-5 mr-2" />
            Go to dashboard ({selectedCities.length} cities)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

