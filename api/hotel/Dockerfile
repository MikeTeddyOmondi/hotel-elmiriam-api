FROM node:16.13.2-alpine

WORKDIR /app

COPY package*.json .

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

COPY . /app

USER 1000

ENV PORT 8000

EXPOSE $PORT

CMD ["node", "./src/index.js"]
