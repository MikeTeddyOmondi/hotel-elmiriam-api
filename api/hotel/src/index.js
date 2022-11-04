const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./routes/routes.js");
const cookieParser = require("cookie-parser");

const { DB_URL, PORT } = require("./config/config.js");

mongoose
	.connect(DB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// authSource: "admin",
	})
	.then(() => {
		const app = express();

		app.use(express.json());
		app.use(cookieParser());
		app.use(
			cors({
				origin: [
					"http://localhost:3000",
					"http://localhost:5000",
					"http://localhost:8080",
				],
				credentials: true,
			}),
		);

		// routes(app);
		app.use("/api/v1",router);

		// Error Middleware
		app.use((err, req, res, next) => {
			const errorStatus = err.status || 500;
			const errorMessage = err.message || "Something went wrong!";
			return res.status(errorStatus).json({
				success: false,
				status: errorStatus,
				message: errorMessage,
				stack: err.stack,
			});
		});

		app.listen(PORT, () => {
			console.log(`> Service running on http://localhost:${PORT}`);
		});
	});
