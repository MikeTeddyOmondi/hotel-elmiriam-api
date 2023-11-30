# Hotel Service

Built on Node.js.

## Build Docker Image

To build the image:
`docker build -t ranckosolutionsinc/hotel-elmiriam-hotel-service:v1.0-alpha . `

## Run the Docker Container

To run the container using the image built:
`docker run -d -p 8001:8001 --network hotel-elmiriam --restart always --name hotel-elmiriam-hotel-service ranckosolutionsinc/hotel-elmiriam-hotel-service:v1.0-alpha`

To run using Docker Compose (inside this directory):
`docker compose -f hotel-service.yml up -d`
