package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	CityId              int      `json:"cityId"`
	CityName            string   `json:"cityName"`
	State               string   `json:"state"`
	Latitude            float64  `json:"latitude"`
	Longitude           float64  `json:"longitude"`
	Temperature         float64  `json:"temperature"`
	ApparentTemperature *float64 `json:"apparentTemperature,omitempty"`
	Precipitation       *float64 `json:"precipitation,omitempty"`
	WeatherCode         *int     `json:"weatherCode,omitempty"`
	WindSpeed           *float64 `json:"windSpeed,omitempty"`
	CloudCover          *float64 `json:"cloudCover,omitempty"`
	IsDay               *bool    `json:"isDay,omitempty"`
	Source              string   `json:"source"`
}

func main() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		panic("Error connecting to RabbitMQ: " + err.Error())
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		panic("Error opening channel: " + err.Error())
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"weather_queue", 
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		panic("Error queue: " + err.Error())
	}

	ch.Qos(1, 0, false)

	msgs, err := ch.Consume(
		q.Name,
		"go-worker-gdash", 
		false,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		panic("Error register consumer: " + err.Error())
	}

	for msg := range msgs {
		var data WeatherData
		if err := json.Unmarshal(msg.Body, &data); err != nil {
			fmt.Println("Invalid Json:", err)
			msg.Nack(false, false)
			continue
		}

		fmt.Printf("Received: %s (%.1f°C)\n", data.CityName, data.Temperature)

		jsonBody, _ := json.Marshal(data)
		resp, err := http.Post(
			"http://127.0.0.1:3000/weather/log",
			"application/json",
			bytes.NewBuffer(jsonBody),
		)

	if err != nil {
		fmt.Println("Error NextJS connection:", err)
		msg.Nack(false, true)
		continue
	}

	if resp != nil {
		bodyBytes, _ := io.ReadAll(resp.Body)
		fmt.Printf("NestJS status %d: %s\n", resp.StatusCode, string(bodyBytes))
	}

		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
			fmt.Printf("Error saving in NextJs (status %d) → requeue\n", resp.StatusCode)
			resp.Body.Close()
			msg.Nack(false, true) 
			continue
		}

		resp.Body.Close()
		fmt.Printf("Save successfully: %s\n", data.CityName)

		msg.Ack(false)
	}
}