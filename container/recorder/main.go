package main

import (
	"context"
	"fmt"
	"log"
	"math"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type record struct {
	DeviceID  string  `dynamodbav:"deviceId"`
	Timestamp string  `dynamodbav:"timestamp"`
	ExpiresAt int64   `dynamodbav:"expiresAt"`
	Value     float64 `dynamodbav:"value"`
}

func putItem(ctx context.Context, client *dynamodb.Client, tableName string) error {
	now := time.Now()
	fmt.Println(now.Format(time.RFC3339))

	metric := &record{
		DeviceID:  "dummy",
		Timestamp: now.Format(time.RFC3339),
		ExpiresAt: now.Add(1 * time.Hour).Unix(),                  // TTL
		Value:     math.Sin(float64(now.Second()) * math.Pi / 30), // -1 ... +1
	}

	// marshal struct into attribute value using struct tag
	av, err := attributevalue.MarshalMap(metric)
	if err != nil {
		return err
	}

	_, err = client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: &tableName,
		Item:      av,
	})
	return err
}

func runRecorder(ctx context.Context, errChan chan error, tableName string) {
	// create DynamoDB client
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		errChan <- err
		return
	}
	client := dynamodb.NewFromConfig(cfg)

	t := time.NewTicker(10 * time.Second)
	defer t.Stop()

	for {
		select {
		case <-t.C:
			// putItem every 10 sec
			err = putItem(ctx, client, tableName)
			if err != nil {
				errChan <- err
				return
			}

		case <-ctx.Done():
			// catch cancel
			return
		}
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// catch SIGTERM for graceful shutdown
	// https://aws.amazon.com/jp/blogs/news/graceful-shutdowns-with-ecs/
	sig := make(chan os.Signal, 1)
	defer close(sig)
	signal.Notify(sig, syscall.SIGTERM)

	// run recorder in goroutine
	errChan := make(chan error)
	defer close(errChan)
	tableName := os.Getenv("DDB_TABLE_NAME")
	go runRecorder(ctx, errChan, tableName)

	for {
		select {
		case err := <-errChan:
			if err != nil {
				cancel()
				log.Fatal(err)
			}
			return

		case <-sig:
			fmt.Println("Caught SIGTERM, shutting down")
			return
		}
	}
}
