# SMS Service

This is a web service for serving SMS for other services in a microservice architecture.

## Technologies Used

1. Express - Web Server framework (Nodejs)
2. Mongoose - Object Data Model (NPM package)
3. jsonwebtoken - for verifying JWTs (NPM package)
4. Docker & Docker Compose - Containerization
5. RabbitMQ - Queue service

### RabbitMQ

Start a Rabbitmq docker container:

`docker run -d --hostname rabbitmq --name rabbitmq -e RABBITMQ_DEFAULT_USER=user -e RABBITMQ_DEFAULT_PASS=password -p 15672:15672 rabbitmq:3.11-management`
