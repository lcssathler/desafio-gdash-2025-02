import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ForecastDay {
  date: string
  tempMean: number
  tempMax: number
  tempMin: number
}

interface ForecastChartProps {
  forecast7d: ForecastDay[]
}

export default function ForecastChart({ forecast7d }: ForecastChartProps) {  
  if (!forecast7d || forecast7d.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
          7 days forecast
        </h3>
        <p className="text-center text-gray-500">Forecast unavailable</p>
      </div>
    )
  }

  const data = forecast7d.map((day) => {
    const dateObj = parse(day.date.split('T')[0], 'yyyy-MM-dd', new Date())
    return {
      data: format(dateObj, "dd 'de' MMM", { locale: ptBR }),
      máxima: Math.round(day.tempMax),
      média: Math.round(day.tempMean),
      mínima: Math.round(day.tempMin),
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-2xl text-sm">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          <p className="text-red-600">Max: {payload.find((p: any) => p.dataKey === 'máxima')?.value}°C</p>
          <p className="text-blue-600 font-semibold">Mean: {payload.find((p: any) => p.dataKey === 'média')?.value}°C</p>
          <p className="text-cyan-600">Min: {payload.find((p: any) => p.dataKey === 'mínima')?.value}°C</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
        7 Days Forecast
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
          <XAxis 
            dataKey="data" 
            tick={{ fill: '#555', fontSize: 14 }}
            style={{ fontWeight: 500 }}
          />
          <YAxis 
            tick={{ fill: '#555' }}
            tickFormatter={(v) => `${v}°`}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={50}
            iconType="line"
          />

          <Line 
            type="monotone" 
            dataKey="máxima" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 6 }}
            name="Max"
          />
          <Line 
            type="monotone" 
            dataKey="média" 
            stroke="#3b82f6" 
            strokeWidth={4}
            dot={{ fill: '#3b82f6', r: 7 }}
            name="Mean"
          />
          <Line 
            type="monotone" 
            dataKey="mínima" 
            stroke="#06b6d4" 
            strokeWidth={3}
            dot={{ fill: '#06b6d4', r: 6 }}
            name="Min"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-8 mt-6 text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded"></div>
          <span>Max</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-500 rounded"></div>
          <span>Mean</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-cyan-500 rounded"></div>
          <span>Min</span>
        </div>
      </div>
    </div>
  )
}