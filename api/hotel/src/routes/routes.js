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

// READ API Information
router.get("/api/v1", ApiInfo);

// READ ALL CUSTOMERS
router.get("/api/v1/customers", getAllCustomers);

// CREATE NEW CUSTOMER
router.post("/api/v1/customers", addCustomer);

// READ CUSTOMER | Search - Reuqires: idnumber
router.get("/api/v1/customers/:idnumber", searchCustomer);

// READ ALL BOOKINGS
router.get("/api/v1/bookings", getAllBookings);

// CREATE NEW BOOKING
router.post("/api/v1/bookings", addBookings);

// READ ALL INVOICES
// router.get("/api/v1/invoices/", getAllBookingInvoice);

// READ ONE INVOICE
// router.get("/api/v1/invoices/:id", getBookingInvoice);

// READ ALL ROOMS
router.get("/api/v1/rooms", fetchAllRooms);

// READ ALL ROOM TYPES AVAILABLE
router.get("/api/v1/rooms/types", allRoomTypes);

// CREATE NEW ROOM TYPE
router.post("/api/v1/rooms/types", createRoomType);

// CREATE ROOM | Requires: roomtypeid
router.post("/api/v1/rooms/:roomtypeid", createRoom);

// READ ROOM INFO | Requires: roomid
router.get("/api/v1/rooms/:roomid", fetchOneRoom);

module.exports = router;
