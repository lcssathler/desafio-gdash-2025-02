import { useState, useEffect } from 'react'

interface City {
  id: number
  nome: string
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla: string
        nome: string
      }
    }
  }
}

export function useCities() {
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statesRes, citiesRes] = await Promise.all([
          fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'),
          fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
        ])

        const statesData: any[] = await statesRes.json()
        const citiesData: City[] = await citiesRes.json()

        const stateSiglas = statesData.map(s => s.sigla).sort()
        setStates(stateSiglas)
        setCities(citiesData)
      } catch (err) {
        console.error('Error loading IBGE data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCitiesByState = (state: string) => {
    return cities
      .filter(c => {
        try {
          return c.microrregiao?.mesorregiao?.UF?.sigla === state
        } catch {
          return false
        }
      })
      .map(c => ({
        id: c.id,
        name: c.nome
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  return { states, getCitiesByState, loading }
}