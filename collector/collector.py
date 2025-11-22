import requests
import json
import time
import pika

CAPITALS = [
    {"cityId": 3550308, "name": "São Paulo",       "state": "SP", "lat": -23.55, "lon": -46.63},
    {"cityId": 3469058, "name": "Belo Horizonte", "state": "MG", "lat": -19.92, "lon": -43.94},
    {"cityId": 3451328, "name": "Porto Alegre",   "state": "RS", "lat": -30.03, "lon": -51.23},
    {"cityId": 3471870, "name": "Salvador",       "state": "BA", "lat": -12.97, "lon": -38.50},
    {"cityId": 3118607, "name": "Recife",         "state": "PE", "lat": -8.05,  "lon": -34.90},
]

def buscar_clima(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,is_day",
        "hourly": "temperature_2m",
        "timezone": "America/Sao_Paulo"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        current = data["current"]
        return {
            "temperature": current["temperature_2m"],
            "apparentTemperature": current.get("apparent_temperature"),
            "precipitation": current.get("precipitation", 0),
            "weatherCode": current.get("weather_code"),
            "windSpeed": current.get("wind_speed_10m"),
            "cloudCover": current.get("cloud_cover"),
            "isDay": current.get("is_day") == 1
        }
    except Exception as e:
        print(f"Erro finding weather: {e}")
        return None

def enviar_para_fila(dado):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='localhost', port=5672)
        )
        channel = connection.channel()
        channel.queue_declare(queue='weather_queue', durable=True)
        
        channel.basic_publish(
            exchange='',
            routing_key='weather_queue',
            body=json.dumps(dado),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print(f"Sent to queue: {dado['cityName']} - {dado['temperature']}°C")
        connection.close()
    except Exception as e:
        print(f"Error sending to abbitMQ: {e}")

while True:
    for cidade in CAPITALS:
        print(f"Collection weather from {cidade['name']}")
        clima = buscar_clima(cidade["lat"], cidade["lon"])
        if clima:
            payload = {
                "cityId": cidade["cityId"],
                "cityName": cidade["name"],
                "state": cidade["state"],
                "latitude": cidade["lat"],
                "longitude": cidade["lon"],
                **clima,
                "source": "open-meteo"
            }
            enviar_para_fila(payload)
    
    print("Collector concluded\n")
    time.sleep(3600)
