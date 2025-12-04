package main

import (
    "bytes"
    "log"
    "net/http"
    "os"

    "github.com/streadway/amqp"
)

func main() {
    rabbitURL := os.Getenv("RABBITMQ_URL")
    backendURL := os.Getenv("BACKEND_URL")

    log.Printf("Connecting to RabbitMQ: %s", rabbitURL)
    log.Printf("Sending logs to backend: %s", backendURL)

    conn, err := amqp.Dial(rabbitURL)
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

    msgs, err := ch.Consume(
        q.Name,
        "",
        false,
        false,
        false,
        false,
        nil,
    )
    failOnError(err, "Error registering consumer")

    log.Println("Worker is running and waiting for messages...")

    for msg := range msgs {
        log.Printf("Received: %s", msg.Body)

        resp, err := http.Post(
            backendURL+"/weather/log",
            "application/json",
            bytes.NewBuffer(msg.Body),
        )

        if err != nil || (resp != nil && resp.StatusCode >= 400) {
            if resp != nil {
                log.Printf("Send error: status %d", resp.StatusCode)
                resp.Body.Close()
            }
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
