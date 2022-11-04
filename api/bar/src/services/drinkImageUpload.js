const path = require("path");
const cloudinary = require("cloudinary").v2;

const { CLOUDINARY_CLOUDNAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("../config/config")

cloudinary.config({
	cloud_name: CLOUDINARY_CLOUDNAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
});

// Cloudinary Image Upload | Function
const upload = async () => {
	const result = await cloudinary.v2.uploader.upload(files, { options });
	return result.url;
};

// Sample Upload response
// {
//   public_id: 'cr4mxeqx5zb8rlakpfkg',
//   version: 1571218330,
//   signature: '63bfbca643baa9c86b7d2921d776628ac83a1b6e',
//   width: 864,
//   height: 576,
//   format: 'jpg',
//   resource_type: 'image',
//   created_at: '2017-06-26T19:46:03Z',
//   bytes: 120253,
//   type: 'upload',
//   url: 'http://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg',
//   secure_url: 'https://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg'
// }

module.exports = { upload };
