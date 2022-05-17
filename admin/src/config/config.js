const path = require("path")

require("dotenv").config({
	path: path.resolve(__dirname, "../.env"),
	debug: true,
});

const { PORT, AUTH_API_URL } = process.env;

module.exports = { PORT, AUTH_API_URL };
