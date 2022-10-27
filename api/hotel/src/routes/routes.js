const express = require("express");
const router = express.Router();

const {
	ApiInfo,
	getAllCustomers,
	addCustomer,
	searchCustomer,
	getAllBookings,
	addBookings,
	getBookingInvoice,
	createRoom,
	createRoomType,
	fetchOneRoom,
	allRoomTypes,
	fetchAllRooms
} = require("../controllers/");

router.get("/", ApiInfo);
router.get("/api/v1", ApiInfo);
router.get("/api/v1/customers", getAllCustomers);
router.post("/api/v1/customers", addCustomer);
router.get("/api/v1/customers/:idnumber", searchCustomer);
router.get("/api/v1/bookings", getAllBookings);
router.post("/api/v1/bookings", addBookings);
// router.get("/api/v1/invoices/", getAllBookingInvoice);
// router.get("/api/v1/invoices/:id", getBookingInvoice);
router.get("/api/v1/rooms", fetchAllRooms);
router.get("/api/v1/rooms/types", allRoomTypes);
router.post("/api/v1/rooms/types", createRoomType);
router.post("/api/v1/rooms/:roomtypeid", createRoom);
router.get("/api/v1/rooms/:roomid", fetchOneRoom);

module.exports = router;
