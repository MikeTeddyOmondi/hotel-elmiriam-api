# Default
default:
  just --list

# Build Docker image
build-image:
  docker build -t ranckosolutionsinc/hotel-elmiriam-api-gateway:v1 .

# Docker compose 
compose:
  docker compose up -d

# Docker compose down
compose-down:
  docker compose down
