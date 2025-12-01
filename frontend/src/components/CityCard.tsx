import useSWR from 'swr';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then(res => res.data.insight || res.data);

interface CityCardProps {
  city: {
    cityId: number;
    cityName: string;
    state: string;
    temperature: number;
    apparentTemperature: number;
    cloudCover: number;
    windSpeed: number;
    precipitation?: number;
  };
}

export function CityCard({ city }: CityCardProps) {
  const { data: insight, isLoading } = useSWR(
    `/weather/insights/grok/${city.cityId}`,
    fetcher,
    { 
      refreshInterval: 600000,
      revalidateOnFocus: false
    }
  );

  return (
    <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{city.cityName}</h3>
          <p className="text-sm text-gray-600">{city.state}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-blue-600">{city.temperature.toFixed(1)}°C</p>
          <p className="text-sm text-gray-500">Sensação {city.apparentTemperature.toFixed(1)}°C</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
        <div>Nuvens: {city.cloudCover}%</div>
        <div>Vento: {city.windSpeed.toFixed(1)} km/h</div>
        {city.precipitation !== undefined && (
          <div>Chuva: {city.precipitation} mm</div>
        )}
      </div>

      {isLoading && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg animate-pulse">
          <p className="text-sm text-gray-600">Gerando análise com IA...</p>
        </div>
      )}

      {insight && !isLoading && (
        <div className="mt-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-900">Análise IA (Groq + Llama3)</span>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed italic">
            "{insight}"
          </p>
        </div>
      )}
    </Card>
  );
}