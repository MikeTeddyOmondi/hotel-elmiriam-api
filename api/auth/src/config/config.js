require("dotenv").config({ path: "./src/.env", debug: true });

const { REFRESH_SECRET, ACCESS_SECRET, DB_URL, PORT } = process.env;

module.exports = {
	REFRESH_SECRET,
	ACCESS_SECRET,
	DB_URL,
	PORT,
};
