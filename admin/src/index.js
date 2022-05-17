const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");
const path = require("path");
const favicon = require("serve-favicon");
// const cookieParser = require("cookie-parser");
// const morgan = require("morgan");

const app = express();

// Env | Config
const { PORT, AUTH_API_URL } = require("./config/config");

// Static Files
app.use(express.static(path.join(__dirname, "../public")));
app.use(
	"/chart.min.js",
	express.static(
		path.join(__dirname, "../node_modules/chart.js/dist/chart.min.js"),
	),
);
app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("view options", {
	layout: false,
});

// Connect flash
// app.use(flash());

// Logs | Routes
// process.env.NODE_ENV === "production"
// 	? app.use(morgan("common"))
// 	: app.use(morgan("dev"));

// Global variables
// app.use(function (req, res, next) {
// 	res.locals.success_msg = req.flash("success_msg");
// 	res.locals.error_msg = req.flash("error_msg");
// 	res.locals.error = req.flash("error");
// 	next();
// });

// Routes
app.use("/", require("./routes/routes.js"));

// Error Pages
app.use((error, req, res, next) => {
	if (error.status == 404) {
		res.status(404).render("404", {
			title: "404 - Page Not Found",
			// layout: "./layouts/errorPage",
		});
	} else if (error.status == 401) {
		res.status(404).render("401", {
			title: "401 - Unauthorized Access",
			// layout: "./layouts/errorPage",
		});
	} else if (error.status == 403) {
		res.status(404).render("403", {
			title: "403 - Forbidden",
			// layout: "./layouts/errorPage",
		});
	} else {
		res.status(500).render("500", {
			title: "500 - Internal Server Error",
			error: error,
			// layout: "./layouts/errorPage",
		});
	}
	next();
});

app.listen(PORT, () => {
	console.log(`App listening on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (error, promise) => {
	console.log(`_____________________________ `);
	console.log(`Unhandled promise rejection: ${promise}`);
	console.log(`Unhandled promise error: ${error.stack || error.message}`);
	// Recommended: send the information to sentry.io
	// or whatever crash reporting service
});

process.on("uncaughtException", (error) => {
	console.log(`_____________________________ `);
	console.log(`Uncaught exception occurred: `);
	console.log(`_____________________________ `);
	console.log(`> Node thread process exiting...`);
	console.log(`> ${error.message}`);
	// Recommended: send the information to sentry.io or whatever crash reporting service
	process.exit(1); // exit application
});
