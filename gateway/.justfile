# Default
default:
  just --list

# Build Docker image
build-image:
  docker build -t ranckosolutionsinc/hotel-elmiriam-api-gateway:v1 .

# Docker compose 
run-compose:
  docker compose up -d

# Docker compose down
run-compose-down:
  docker compose down
