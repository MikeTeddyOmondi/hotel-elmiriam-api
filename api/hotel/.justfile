# Default
default:
  just --list

# Build docker image
build-image:
  docker build -t ranckosolutionsinc/hotel-elmiriam-hotel-service:v1.0-alpha . 

# Docker compose 
run-compose:
  docker compose -f hotel-service.yml up -d

# Docker compose down
run-compose-down:
  docker compose -f hotel-service.yml down

