interface CityWeather {
  cityId: number
  cityName: string
  temperature: number
  precipitation?: number
  windSpeed?: number
  cloudCover?: number
  apparentTemperature: number
  createdAt: string
  forecast7d: any[]
  latitude: number
  longitude: number
  source: string
  state: string
  time: string
  updatedAt: string
  weatherCode: number
  __v?: number
  _id?: string
}

export type { CityWeather };

