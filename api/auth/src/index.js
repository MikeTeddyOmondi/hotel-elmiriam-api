const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./routes/routes.js");

const PORT = 8000;
const DB_URL =
	process.env.DB_URL || "mongodb://admin:password@127.0.0.1:27017/auth";

mongoose
	.connect(DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		authSource: "admin",
	})
	.then(() => {
		const app = express();

		app.use(express.json());
		app.use(cookieParser());
		app.use(
			cors({
				origin: ["http://localhost:3000", "http://localhost:8080"],
				credentials: true,
			}),
		);

		// routes(app);
		app.use(router);

		app.listen(PORT, () => {
			console.log(`Service running on port ${PORT}`);
		});
	});
