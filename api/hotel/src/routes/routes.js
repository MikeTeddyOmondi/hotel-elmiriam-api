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
	fetchAllRooms,
} = require("../controllers/");

// READ API Information
router.get("/", ApiInfo);

// READ ALL CUSTOMERS
router.get("/customers", getAllCustomers);

// CREATE NEW CUSTOMER
router.post("/customers", addCustomer);

// READ CUSTOMER | Search - Reuqires: idnumber
router.get("/customers/:idnumber", searchCustomer);

// READ ALL BOOKINGS
router.get("/bookings", getAllBookings);

// CREATE NEW BOOKING
router.post("/bookings", addBookings);

// READ ALL INVOICES
// router.get("/invoices/", getAllBookingInvoice);

// READ ONE INVOICE
// router.get("/invoices/:id", getBookingInvoice);

// READ ALL ROOMS
router.get("/rooms", fetchAllRooms);

// READ ALL ROOM TYPES AVAILABLE
router.get("/rooms/types", allRoomTypes);

// CREATE NEW ROOM TYPE
router.post("/rooms/types", createRoomType);

// CREATE ROOM | Requires: roomtypeid
router.post("/rooms/:roomtypeid", createRoom);

// READ ONE ROOM INFO | Requires: roomid
router.get("/rooms/:roomid", fetchOneRoom);

module.exports = router;
