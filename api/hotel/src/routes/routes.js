const express = require("express");
const router = express.Router();

const {
	verifyToken,
	verifyUser,
	verifyAdmin,
} = require("../utils/verifyToken");

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
	fetchAllRooms,
} = require("../controllers/index.js");

// READ API Information
router.get("/", verifyToken, ApiInfo);

// READ ALL CUSTOMERS
router.get("/customers", verifyUser, getAllCustomers);

// CREATE NEW CUSTOMER
router.post("/customers", verifyUser, addCustomer);

// READ CUSTOMER | Search - Requires: idnumber
router.get("/customers/:idnumber", verifyUser, searchCustomer);

// READ ALL BOOKINGS
router.get("/bookings", verifyUser, getAllBookings);

// CREATE NEW BOOKING
router.post("/bookings", verifyToken, addBookings);

// READ ALL INVOICES
// router.get("/invoices/", getAllBookingInvoice);

// READ ONE INVOICE
// router.get("/invoices/:id", getBookingInvoice);

// READ ALL ROOMS
router.get("/rooms", verifyAdmin, fetchAllRooms);

// READ ALL ROOM TYPES AVAILABLE
router.get("/rooms/types", verifyAdmin, allRoomTypes);

// CREATE NEW ROOM TYPE
router.post("/rooms/types", verifyAdmin, createRoomType);

// CREATE ROOM | Requires: roomtypeid
router.post("/rooms/:roomtypeid", verifyAdmin, createRoom);

// READ ONE ROOM INFO | Requires: roomid
router.get("/rooms/:roomid", verifyAdmin, fetchOneRoom);

module.exports = router;
