require("dotenv").config({
	path: "./src/.env",
	debug: process.env.NODE_ENV === "development" ? true : false,
});

const { REFRESH_SECRET, ACCESS_SECRET, DB_URL, PORT, KID, NODE_ENV } =
	process.env;

module.exports = {
	REFRESH_SECRET,
	ACCESS_SECRET,
	DB_URL,
	PORT,
	KID,
	NODE_ENV,
};
