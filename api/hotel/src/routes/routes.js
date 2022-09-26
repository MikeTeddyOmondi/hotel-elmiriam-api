const express = require("express");
const router = express.Router();

const {
	ApiInfo,
	getAllCustomers,
	addCustomer,
	getAllBookings,
	searchCustomer,
	getBookingInvoice,
	getRoomInfo,
} = require("../controllers/");

router.get("/", ApiInfo);
router.get("/api/v1", ApiInfo);
router.get("/api/v1/customers", getAllCustomers);
router.post("/api/v1/customers", addCustomer);
router.get("/api/v1/bookings", getAllBookings);
router.get("/api/v1/customers/<userid>", searchCustomer);
router.post("/api/v1/invoice/<id>", getBookingInvoice);
router.post("/api/v1/room/<id>", getRoomInfo);

module.exports = router;
