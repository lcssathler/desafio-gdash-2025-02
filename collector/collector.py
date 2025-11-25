import requests
import time
from typing import List, Dict

SELECTED_CITIES_URL = "http://localhost:3000/weather/selected-cities"
IBGE_MUN_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
IBGE_MALHA_URL = "https://servicodados.ibge.gov.br/api/v4/malhas/municipios"

def get_selected_cities() -> List[int]:
    try:
        response = requests.get(SELECTED_CITIES_URL)
        if response.status_code == 200:
            data = response.json()
            return data.get("citiesId", [])
    except:
        pass
    return []

def get_city_info(city_id: int):
    try:
        r1 = requests.get(f"{IBGE_MUN_URL}/{city_id}")
        data = r1.json()
        name = data["nome"]
        state = data["microrregiao"]["mesorregiao"]["UF"]["sigla"]

        r2 = requests.get(f"{IBGE_MALHA_URL}/{city_id}/metadados")
        malha = r2.json()
        centroide = malha[0]["centroide"]
        lat = centroide["latitude"]
        lon = centroide["longitude"]

        return {
            "cityId": city_id,
            "cityName": name,
            "state": state,
            "latitude": float(lat),
            "longitude": float(lon)
        }
    except Exception as e:
        print(f"Error get info of city {city_id}: {e}")
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
    print(f"Selected cities: {city_ids}")
    
    if not city_ids:
        print("No selected cities found")
        time.sleep(60)
        continue

    print(f"Start collection weather")
    
    for city_id in city_ids:
        city_info = get_city_info(city_id)
        print(f"Collecting data for city {city_info}")
        if not city_info:
            print(f"Can't find coordinates for city {city_id}")
            continue
            
        weather = get_weather(city_info["latitude"], city_info["longitude"])
        if weather:
            payload = {
                "cityId": city_id,
                "cityName": city_info["cityName"],
                "state": city_info["state"],
                "latitude": city_info["latitude"],
                "longitude": city_info["longitude"],
                **weather,
                "source": "open-meteo"
            }
            send_queue(payload)
        else:
            print(f"Error get weather from {city_info['name']}")
        
        time.sleep(1) 
    print(f"Collector concluded successfully")
    time.sleep(3600) 