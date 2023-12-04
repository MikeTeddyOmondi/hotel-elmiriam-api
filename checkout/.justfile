# List commands
default:
  just --list

# Docker build image
build-image:
  docker build --pull -t ranckosolutionsinc/mpesa-service . 

# Docker Container
run-container:
  docker run -d -p 3000:3000 --name mpesa-service ranckosolutionsinc/mpesa-service 

# Docker compose
run-compose:
  docker compose -f checkout-service.yml  up -d 

# Docker compose down
run-compose-down:
  docker compose -f checkout-service.yml  down 

# Start RabbitMQ 
start_rabbitmq:
  docker run -d --hostname rabbitmq --name rabbitmq -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management

