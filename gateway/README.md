# KrakenD | API Gateway

Built on Go programming language.

## Build Docker Image

To build the image:
`docker build -t ranckosolutionscinc/hotel-elmiriam-api-gateway:v1 .`

## Run the Docker Container

To run the container using the image built:
`docker run -d -p 8009:8009 --network hotel-elmiriam --restart always --name hotel-elmiriam-api-gateway ranckosolutionscinc/hotel-elmiriam-api-gateway:v1`

To run using Docker Compose (inside this directory):
`docker compose up -d`
