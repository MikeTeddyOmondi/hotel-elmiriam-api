# Default
default:
  just --list

# Build docker image
build-image:
  docker build -t ranckosolutionsinc/hotel-elmiriam-bar-service:v1.0-alpha . 

# Docker compose 
compose:
  docker compose -f bar-service.yml up -d

# Docker compose down
compose-down:
  docker compose -f bar-service.yml down

