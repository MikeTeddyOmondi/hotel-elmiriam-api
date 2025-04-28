import { connect } from "amqplib";
import { config } from "dotenv";
import { Hono } from "hono";
// import { QueueMsg } from "./types.js";
import checkout from "./utils/checkout.js";

config();

const app = new Hono();
const { RABBITMQ_URL } = process.env;

(async () => {
  const queue = "mpesa";

  let connection;

  try {
    connection = await connect(RABBITMQ_URL);
  } catch (error) {
    console.error({connErr: `RabbitMQ connection failed: ${error.message}`});
    return;
  }

  const mpesaChannel = await connection.createChannel();
  await mpesaChannel.assertQueue(queue);

  // Listener
  await mpesaChannel.consume(queue, async (msg) => {
    if (msg !== null) {
      console.log("Recieved:", msg.content.toString("utf8"));
      try {
        let queueMsg = msg.content.toString();
        // console.log({ queueMsg });

        await checkout(queueMsg);
      } catch (error) {
        console.log(`Error while consuming the queue message: ${error};`);
      }
      mpesaChannel.ack(msg);
    } else {
      console.log("Consumer cancelled by server");
    }
  });
})();

app.get("*", (c) =>
  c.json({
    apiVersion: "1.0.0",
    apiDescription: "Mpesa Service",
  })
);

export default {
  port: 8008,
  fetch: app.fetch 
};

console.log(`[#] Checkout service running on 8008`)