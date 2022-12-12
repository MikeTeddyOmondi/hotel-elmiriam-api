const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary")

const {
	CLOUDINARY_CLOUDNAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
} = require("../config/config");

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUDNAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "hotel-elmiriam"
	}
})
const imageUploads = multer({ storage }).single("image");

module.exports = { imageUploads };
