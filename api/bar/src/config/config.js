const path = require('path')
let env = path.join(__dirname, '..', '..', '.env')

require("dotenv").config({
	path: env,
	debug: process.env.NODE_ENV === "development" ? true : false,
});

const {
	REFRESH_SECRET,
	ACCESS_SECRET,
	DB_URL,
	PORT,
	CLOUDINARY_CLOUDNAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
} = process.env;

module.exports = {
	REFRESH_SECRET,
	ACCESS_SECRET,
	DB_URL,
	PORT,
	CLOUDINARY_CLOUDNAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
};
