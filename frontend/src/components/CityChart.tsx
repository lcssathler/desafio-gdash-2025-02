import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { CityWeather } from '@/components/interfaces/CityWeather'

interface Props {
  cities: CityWeather[]
}

export default function CityChart({ cities }: Props) {
  const chartData = cities.map(city => ({
    name: city.cityName.split(' ')[0],
    temp: city.temperature
  }))

  return (
    <Cardlike>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Cardlike>
  )
}

function Cardlike({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {children}
    </div>
  )
}
