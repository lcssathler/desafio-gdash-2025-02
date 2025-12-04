import pika
import json

RABBIT_URL = "amqp://X4AoIRHVuNqFDdJA:qMwBLtwQ.sHRPaJPF4gJqr.cyNbu-dOu@hopper.proxy.rlwy.net:41585"

try:
    # Usando a URL completa do Railway
    params = pika.URLParameters(RABBIT_URL)
    params.heartbeat = 600
    params.blocked_connection_timeout = 300

    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    # garante que a fila existe
    channel.queue_declare(queue='weather_queue', durable=True)

    print("Collector connected to RabbitMQ")

except Exception as e:
    print("RabbitMQ connection error:", e)
    exit(1)


trigger_collection = False

channel.basic_publish(
    exchange="",
    routing_key="teste2",
    body="hello",
    properties=pika.BasicProperties(delivery_mode=2)
)

