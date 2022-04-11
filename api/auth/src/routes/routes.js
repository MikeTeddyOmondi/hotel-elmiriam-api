const express = require("express");
const router = express.Router();

const {
	ApiInfo,
	AuthenticatedUser,
	Login,
	Logout,
	Refresh,
	Register,
} = require("../controllers/auth.js");

router.get("/api/v1", ApiInfo);
router.post("/api/v1/register", Register);
router.post("/api/v1/login", Login);
router.get("/api/v1/user", AuthenticatedUser);
router.post("/api/v1/refresh", Refresh);
router.post("/api/v1/logout", Logout);

module.exports = router;
