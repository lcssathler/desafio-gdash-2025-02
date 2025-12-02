import requests
import time
import pika
import json
from typing import List, Dict
from threading import Thread
import uvicorn
from fastapi import FastAPI

app = FastAPI()

SELECTED_CITIES_URL = "http://backend:3000/weather/selected-cities"
ALL_LOGS_URL = "http://backend:3000/weather/logs?limit=1000"
IBGE_MUN_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
IBGE_MALHA_URL = "https://servicodados.ibge.gov.br/api/v4/malhas/municipios"
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

global channel

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
    print(f"Getting info of city {city_id}")
    try:
        r1 = requests.get(f"{IBGE_MUN_URL}/{city_id}")
        data = r1.json()
        print(f"Fetched city data: {data}")
        name = data["nome"]
        state = data["microrregiao"]["mesorregiao"]["UF"]["sigla"]

        r2 = requests.get(f"{IBGE_MALHA_URL}/{city_id}/metadados")
        malha = r2.json()
        print(f"Fetched malha data: {malha}")
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

def collect_cities(city_ids: List[int], reason: str):
    print(f"\n[{reason}] Collecting {city_ids} cities")
    for city_id in city_ids:
        city = get_city_info(city_id)
        if not city: continue
        weather = get_weather_and_forecast(city["latitude"], city["longitude"])
        if not weather: continue

        payload = {**city, **weather, "source": "open-meteo", "trigger": reason}
        channel.basic_publish(
            exchange='',
            routing_key='weather_queue',
            body=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print(f"SENT: {city['cityName']}: {weather['temperature']}°C")

def get_weather_and_forecast(lat: float, lon: float) -> Dict:
    print(f"Getting weather for lat={lat}, lon={lon}")
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ["temperature_2m_mean", "temperature_2m_max", "temperature_2m_min", "precipitation_probability_mean"],
        "current": ["temperature_2m", "apparent_temperature", "precipitation", "weather_code", "cloud_cover", "wind_speed_10m"],
        "timezone": "America/Sao_Paulo"
    }

    try:
        data = requests.get(OPEN_METEO_URL, params=params).json()
        forecast_7d = []
        qt = len(data["daily"]["time"])

        for i in range(qt):
            date = data["daily"]["time"][i]
            temp_mean = data["daily"]["temperature_2m_mean"][i]
            temp_max = data["daily"]["temperature_2m_max"][i]
            temp_min = data["daily"]["temperature_2m_min"][i]
            precipitation_prob_mean = data["daily"]["precipitation_probability_mean"][i]
            forecast_7d.append({"date": date, "tempMean": temp_mean, "tempMax": temp_max, "tempMin": temp_min, "precipitationProbMean": precipitation_prob_mean})

        current = data["current"]
        return {
            "temperature": current["temperature_2m"],
            "apparentTemperature": current.get("apparent_temperature"),
            "precipitation": current.get("precipitation"),
            "weatherCode": current.get("weather_code"),
            "cloudCover": current.get("cloud_cover"),
            "windSpeed": current.get("wind_speed_10m"),
            "time": current.get("time"),
            "forecast7d": forecast_7d
        }   
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return {}

def get_cities_with_existing_data() -> list[int]:
    try:
        r = requests.get(ALL_LOGS_URL, timeout=15)
        if r.status_code == 200:
            logs = r.json().get("data", [])
            city_ids = {log["cityId"] for log in logs if "cityId" in log}
            return list(city_ids)
        return []
    except Exception as e:
        print(f"[ERRO] Cant get logs: {e}")
        return []



try:
    credentials = pika.PlainCredentials("guest", "guest")
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="rabbitmq", port=5672, heartbeat=600, credentials=credentials)
    )
    channel = connection.channel()
    channel.queue_declare(queue='weather_queue', durable=True)
    print("Collector connected to RabbitMQ")
except Exception as e:
    print(e)
    exit(1)

trigger_collection = False

def collect_all_cities():
    global trigger_collection
    trigger_collection = False
    print("Trigger started")
    
    city_ids = get_selected_cities()
    if not city_ids:
        print("None selected cities to collect")
        return

    for city_id in city_ids:
        city = get_city_info(city_id)
        if not city:
            continue
        weather = get_weather_and_forecast(city["latitude"], city["longitude"])
        if not weather:
            continue

        payload = {**city, **weather, "source": "open-meteo", "triggered": True}
        channel.basic_publish(
            exchange='',
            routing_key='weather_queue',
            body=json.dumps(payload).encode('utf-8'),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print(f"SENT → {city['cityName']}: {weather['temperature']}°C")

@app.post("/trigger")
async def trigger_immediate():
    city_ids = get_selected_cities()
    print(f"Trigger immediate collection for {city_ids} cities")
    if not city_ids:
        return {"status": "empty"}

    collect_cities(city_ids, reason="nova-selecao")
    return {"status": "success", "collected": len(city_ids)}

def periodic_update():
    while True:
        cities_to_update = get_cities_with_existing_data()
        if cities_to_update:
            print(f"\n[SCHEDULED UPDATING] Updating {len(cities_to_update)} cities")
            collect_cities(cities_to_update, reason="atualizacao-horaria")
        else:
            print("\n[WAITING] None city selected. Waiting for it")
        
        time.sleep(3600)

if __name__ == "__main__":
    print("Collector STARTED")
    
    Thread(target=uvicorn.run, args=(app,), kwargs={"host": "0.0.0.0", "port": 8000}, daemon=True).start()
    Thread(target=periodic_update, daemon=True).start()

    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        connection.close()