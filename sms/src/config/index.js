const path = require("path");
const { config } = require("dotenv");

config({
  path: path.join(__dirname, "..", ".env"),
  debug: process.env.NODE_ENV === "development" ? true : false,
});

const PORT = process.env.PORT || 33000;
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const NODE_ENV = process.env.NODE_ENV || "development";
const MOBITECH_API_URL = process.env.MOBITECH_API_URL;
const MOBITECH_API_KEY = process.env.MOBITECH_API_KEY;
const MOBITECH_API_USERNAME = process.env.MOBITECH_API_USERNAME;

module.exports = {
  PORT,
  NODE_ENV,
  RABBITMQ_URL,
  MOBITECH_API_URL,
  MOBITECH_API_KEY,
  MOBITECH_API_USERNAME,
};
