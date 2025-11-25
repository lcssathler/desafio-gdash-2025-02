package main

import (
    "bytes"
    "log"
    "net/http"
    "github.com/streadway/amqp"
)

func main() {
    conn, err := amqp.Dial("amqp://guest:guest@rabbitmq:15672/")
    failOnError(err, "Error connecting to RabbitMQ")
    defer conn.Close()

    ch, err := conn.Channel()
    failOnError(err, "Error opening channel")
    defer ch.Close()

    q, err := ch.QueueDeclare(
        "weather_queue",
        true,
        false,
        false,
        false,
        nil,
    )
    failOnError(err, "Error declaring queue")

    msgs, err := ch.Consume(q.Name,"",false, false, false, false, nil)
    failOnError(err, "Error register consumer")

    log.Println("Worker running")

    
    for msg := range msgs {
        log.Printf("Received: %s", msg.Body)

        resp, err := http.Post("http://backend:3000/weather/log",
            "application/json",
            bytes.NewBuffer(msg.Body),
        )

        if err != nil || (resp != nil && resp.StatusCode >= 400) {
            log.Printf("Send error: %v", err)
            msg.Nack(false, true)
            continue
        }

        if resp != nil {
            resp.Body.Close()
        }

        msg.Ack(false)
        log.Println("Message processed successfully")
    }
}

func failOnError(err error, msg string) {
    if err != nil {
        log.Fatalf("%s: %s", msg, err)
    }
}