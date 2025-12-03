import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'
import { Sun, MapPin } from 'lucide-react'

type State = {
  id: number
  sigla: string
  nome: string
}

type City = {
  id: number
  nome: string
  latitude?: number
  longitude?: number
}

export default function Home() {
  const navigate = useNavigate()
  const [states, setStates] = useState<State[]>([])
  const [selectedState, setSelectedState] = useState<string>('')
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const [selectedCities, setSelectedCities] = useState<number[]>([])
  const [loadingStates, setLoadingStates] = useState<boolean>(false)
  const [loadingCities, setLoadingCities] = useState<boolean>(false)
  const [searchCity, setSearchCity] = useState<string>('')

  const handleCityToggle = (cityId: number) => {
    setSelectedCities(prev =>
      prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    )
  }

  const handleContinue = async (citiesToSend?: number[]) => {
    const ids = citiesToSend ?? selectedCities
    if (ids.length > 0) {
      localStorage.setItem('selectedCities', JSON.stringify(ids))

      await fetch('http://localhost:3000/weather/selected-cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ citiesId: ids })
      })

      navigate('/cities')
    }
  }

  const fetchStates = async () => {
    setLoadingStates(true)
    try {
      const res = await api.get('/cities/states')
      const data: State[] = res.data || []
      setStates(data)
      if (!selectedState && data.length > 0) setSelectedState(data[0].sigla)
    } finally {
      setLoadingStates(false)
    }
  }

  const fetchCitiesByState = async (uf: string) => {
    setLoadingCities(true)
    try {
      const res = await api.get(`/cities/state/${uf}`)
      const data: City[] = res.data || []
      setCities(data)
      setFilteredCities(data)
      setSelectedCities([])
      setSearchCity('')
    } finally {
      setLoadingCities(false)
    }
  }

  useEffect(() => {
    fetchStates()
  }, [])

  useEffect(() => {
    if (selectedState) fetchCitiesByState(selectedState)
  }, [selectedState])

  useEffect(() => {
    const value = searchCity.toLowerCase()
    const filtered = cities.filter(city =>
      city.nome.toLowerCase().includes(value)
    )
    setFilteredCities(filtered)
  }, [searchCity, cities])

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
                  <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select a state'} />
                </SelectTrigger>
                <SelectContent>
                  {loadingStates ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading states...</div>
                  ) : (
                    states.map(state => (
                      <SelectItem key={state.id} value={state.sigla}>{state.nome}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedState && (
              <div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="city-search">Search city</Label>
                  <input
                    id="city-search"
                    type="text"
                    value={searchCity}
                    onChange={e => setSearchCity(e.target.value)}
                    placeholder="Type a city name..."
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 
                               bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 
                               focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 max-h-96 overflow-y-auto p-4 border rounded-lg">
                  {loadingCities ? (
                    <div className="col-span-full text-center text-sm text-muted-foreground">Loading cities...</div>
                  ) : (
                    filteredCities.map(city => (
                      <div key={city.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`city-${city.id}`}
                          checked={selectedCities.includes(city.id)}
                          onCheckedChange={() => handleCityToggle(city.id)}
                        />
                        <label htmlFor={`city-${city.id}`} className="text-sm cursor-pointer">
                          {city.nome}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => handleContinue()}
            disabled={selectedCities.length === 0}
          >
            <MapPin className="w-5 h-5 mr-2" />
            Go to dashboard ({selectedCities.length} cities)
          </Button>

          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                ;(async () => {
                  if (states.length === 0) await fetchStates()
                  const uf = selectedState || (states.length > 0 ? states[0].sigla : '')
                  if (!uf) return
                  await fetchCitiesByState(uf)
                  const allIds = cities.map(c => c.id)
                  await handleContinue(allIds)
                })()
              }}
            >
              Load state and continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
