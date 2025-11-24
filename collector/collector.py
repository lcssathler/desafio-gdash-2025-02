import requests
import time
from typing import List, Dict

SELECTED_CITIES_URL = "http://localhost:3000/weather/selected-cities"

def get_selected_cities() -> List[int]:
    try:
        response = requests.get(SELECTED_CITIES_URL)
        if response.status_code == 200:
            data = response.json()
            return data.get("cityIds", [])
    except:
        pass
    return []

def get_city_coordinates(city_id: int) -> Dict:
    url = f"https://servicodados.ibge.gov.br/api/v1/localidades/municipios/{city_id}"
    try:
        data = requests.get(url).json()
        lat = data['latitude']
        lon = data['longitude']
        name = data['nome']
        state = data['microrregiao']['mesorregiao']['UF']['sigla']
        return {"lat": lat, "lon": lon, "name": name, "state": state, "cityId": city_id}
    except:
        return None

def get_weather(lat: float, lon: float) -> Dict:
    url = f"https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "apparent_temperature", "precipitation", "weather_code", "cloud_cover", "wind_speed_10m"],
        "timezone": "America/Sao_Paulo"
    }
    try:
        data = requests.get(url, params=params).json()
        current = data["current"]
        return {
            "temperature": current["temperature_2m"],
            "apparentTemperature": current.get("apparent_temperature"),
            "precipitation": current.get("precipitation"),
            "weatherCode": current.get("weather_code"),
            "cloudCover": current.get("cloud_cover"),
            "windSpeed": current.get("wind_speed_10m"),
        }
    except:
        return None

def send_queue(payload: Dict):
    try:
        requests.post("http://localhost:3000/weather/log", json=payload, timeout=10)
        print(f"Sent city {payload['cityName']} with {payload['temperature']}°C to queue")
    except Exception as e:
        print(f"Error sending {payload.get('cityName', '?')}: {e}")

while True:
    city_ids = get_selected_cities()
    
    if not city_ids:
        print("No selected cities found")
        time.sleep(60)
        continue

    print(f"Start collection weather")
    
    for city_id in city_ids:
        city_info = get_city_coordinates(city_id)
        if not city_info:
            print(f"Can't find coordinates for city {city_id}")
            continue
            
        clima = get_weather(city_info["lat"], city_info["lon"])
        if clima:
            payload = {
                "cityId": city_id,
                "cityName": city_info["name"],
                "state": city_info["state"],
                "latitude": city_info["lat"],
                "longitude": city_info["lon"],
                **clima,
                "source": "open-meteo"
            }
            send_queue(payload)
        else:
            print(f"Error get weather from {city_info['name']}")
        
        time.sleep(1) 
    print(f"Collector concluded successfully")
    time.sleep(3600) 