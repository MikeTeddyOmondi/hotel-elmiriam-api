// const bcryptjs = require("bcryptjs");
// const { sign, verify } = require("jsonwebtoken");

const Customer = require("../models/Customer.js");

// Import Hotel Service
const {
	saveCustomer,
	fetchAllCustomers,
	fetchBookings,
	searchCustomer,
	findCustomer,
	findRoom,
	saveBooking,
	checkRoomAvailability,
	updateRoomStatus,
} = require("../services/hotel.service");

// const { REFRESH_SECRET, ACCESS_SECRET } = require("../config/config.js");

exports.ApiInfo = async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Hotel API",
	});
};

// ________________________________________________
// CUSTOMERS INFORMATION
// ________________________________________________

// Add Customers List View | GET
exports.getAllCustomers = async (req, res) => {
	const customers = await fetchAllCustomers();

	res.status(200).json({
		success: true,
		customers,
	});
};

// Add Customers | POST
exports.addCustomer = async (req, res) => {
	const { firstname, lastname, id_number, phone_number, email } = req.body;

	let errors = {};

	if (!firstname || !lastname || !id_number || !email) {
		errors = { messsage: "Please enter all fields" };

		return res.status(500).json({
			success: false,
			data: errors,
		});
	}

	if (firstname.length < 3) {
		errors = {
			messsage: "Firstname must be at least 3 characters long!",
		};

		return res.status(500).json({
			success: false,
			data: errors,
		});
	}
	if (lastname.length < 3) {
		errors = { messsage: "Lastname must be at least 3 characters long!" };

		return res.status(500).json({
			success: false,
			data: errors,
		});
	}

	if (errors.length > 0) {
		return res.status(500).json({
			success: false,
			data: errors,
		});
	} else {
		// Check if the provided ID number exists in the database
		Customer.findOne({ id_number }).then((idNumberExists) => {
			if (idNumberExists) {
				errors = {
					messsage: `ID number already exists!`,
				};

				return res.status(500).json({
					success: false,
					data: errors,
				});
			} else {
				// Check if the provided email exists in the database
				Customer.findOne({ email }).then((emailExists) => {
					if (emailExists) {
						errors = {
							messsage: `Email already exists!`,
						};

						return res.status(500).json({
							success: false,
							data: errors,
						});
					} else {
						// Create a customer details | Object
						let customerDetails = {
							firstname,
							lastname,
							id_number,
							phone_number,
							email,
						};
						// Save the customer details
						saveCustomer(customerDetails)
							.then((id) => {
								console.log(`> [CREATED] Customer: ${id}`);

								res.status(201).json({
									success: true,
									data: {
										customer: id,
									},
								});
							})
							.catch((err) => {
								console.log(`> [Controller] error - ${err}`);

								errors = {
									messsage: `An error occurred while saving!`,
								};

								res.status(500).json({
									success: false,
									data: errors,
								});
							});
					}
				});
			}
		});
	}
};

// ________________________________________________
// ADD HOTEL ACCOMODATIONS | INFORMATION
// ________________________________________________

// Room Booking List View | GET
exports.getAllBookings = (req, res) => {
	let errors = {};

	// Fetching All Bookings Made
	fetchBookings()
		.then((bookings) => {
			res.status(200).json({
				success: true,
				bookings,
			});
		})
		.catch((err) => {
			errors = {
				message: `Error: ${err.message}`,
			};

			res.status(500).json({
				success: false,
				data: errors,
			});
		});
};

// Room Booking List View | Search Customer by ID Number in query paramas | GET 
exports.searchCustomer = async (req, res) => {
	// Initialize customerID
	// let customerID;

	// Body | Request Params
	const { id_number } = req.params;
	console.log(id_number)

	// Search customer with the id
	await searchCustomer(id_number)
		.then((customerFound) => {
			console.log(`> Customer ID: ${customerFound._id}`);
			console.log(`> Customer Details: ${customerFound}`);
			// customerID = customerFound._id;
			// req.session.customerID = customerID;

			return res.status(200).json({
				...customerFound
			})
		})
		.catch((err) => {
			console.log(`> [Controller] error - ${err.message}`);

			// req.flash(
			// 	"error_msg",
			// 	`There is no customer with this ID number: ${id_number}...`,
			// );

			// return res.redirect("/admin/bookings/search-customer");

			return res.status(500).json({
				err
			})
		});

	// res.redirect("/admin/bookings/booking-details");
};

// Admin Panel - POST | Bookings Details Page
exports.addBookingDetails = async (req, res) => {
	// Body | Request
	const {
		customerId,
		numberAdults,
		numberKids,
		roomType,
		roomNumber,
		check_in_date,
		check_out_date,
	} = req.body;

	let errors = [];

	// Initialize booking, customer & room details
	let bookingDetails;
	let customerDetails;
	let roomDetails;

	// Find customer with the customerId
	await findCustomer(customerId)
		.then((customerFound) => {
			// console.log(`> Customer Details: ${customerFound}`);
			customerDetails = customerFound;
		})
		.catch((err) => {
			console.log(`[Controller] error: ${err}`);
		});

	// Find room given the room number
	await findRoom(roomNumber)
		.catch((err) => {
			console.log(`> [Controller] error: ${err}`);
		})
		.then((roomFound) => {
			// Check Room Availability

			// console.log(`> Room Details: ${roomFound}`);
			roomDetails = roomFound;
		});

	const { roomRate, _id } = roomDetails;
	const roomID = _id;

	// Check room if its available
	let availability = await checkRoomAvailability(roomNumber);
	console.log("> Is room booked? ", availability);

	// Booking Logic
	let numberOccupants = parseInt(numberAdults) + parseInt(numberKids);

	if (
		!numberAdults ||
		!numberKids ||
		!roomType ||
		!roomNumber ||
		!check_in_date ||
		!check_out_date
	) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (numberOccupants > roomDetails.roomCapacity) {
		errors.push({ msg: "Room capacity of the chosen room has been exceeded!" });
	}

	if (availability == true) {
		errors.push({ msg: "Room is not available. Try another room!" });
	}

	if (errors.length > 0) {
		return res.render("admin/addBookingsDetails", {
			errors,
			customerID: req.session.customerID,
			numberAdults,
			numberKids,
			roomType,
			roomNumber,
			check_in_date,
			check_out_date,
			user: req.user,
			title: "Room Bookings | Accomodation",
			layout: "./layouts/adminLayout",
		});
	}
	bookingDetails = {
		customerId,
		numberAdults,
		numberKids,
		roomID,
		roomType,
		roomNumber,
		roomRate,
		check_in_date,
		check_out_date,
	};

	// Update room status to >>> isBooked: true
	let result = await updateRoomStatus(roomNumber, true);

	// Save booking
	await saveBooking(bookingDetails)
		.then((invoiceInfo) => {
			// console.log(`> [NEW] Booking Info: ${invoiceInfo}`);

			// Load invoice information into the session | request object
			req.session.bookingID = invoiceInfo._id;
			req.session.firstname = customerDetails.firstname;
			req.session.lastname = customerDetails.lastname;
			req.session.phoneNumber = customerDetails.phone_number;
			req.session.email = customerDetails.email;
			req.session.roomType = bookingDetails.roomType;
			req.session.roomRate = bookingDetails.roomRate;
			req.session.numberOccupants = numberOccupants;
			req.session.check_in_date = invoiceInfo.checkInDate;
			req.session.check_out_date = invoiceInfo.checkOutDate;
			req.session.subTotal = invoiceInfo.subTotalCost;
			req.session.VAT = invoiceInfo.vat;
			req.session.totalCost = invoiceInfo.totalCost;

			// Redirect to Customer Invoice
			res.redirect("/admin/bookings/invoice");
		})
		.catch((err) => {
			console.log(`> [Controller] error: ${err}`);
		});
};

// Admin Panel - GET | Bookings Invoice Page
exports.getBookingInvoice = (req, res) => {
	const {
		bookingID,
		firstname,
		lastname,
		phoneNumber,
		email,
		roomType,
		roomRate,
		numberOccupants,
		check_in_date,
		check_out_date,
		subTotal,
		VAT,
		totalCost,
	} = req.session;
	res.render("admin/bookingsInvoice", {
		bookingID,
		firstname,
		lastname,
		phoneNumber,
		email,
		roomType,
		roomRate,
		numberOccupants,
		check_in_date,
		check_out_date,
		subTotal,
		VAT,
		totalCost,
		user: req.user,
		title: "Room Bookings | Accomodation | Invoice",
		layout: "./layouts/adminLayout",
	});
};

// ______________________________________
// ADD ROOM INFORMATION
// ______________________________________

// Room Info | GET
exports.getRoomInfo = (req, res) => {
	// res.render("admin/addRoomInfo", {
	// 	user: req.user,
	// 	title: "Add Room Info",
	// 	layout: "./layouts/adminLayout.ejs",
	// });
};

// Room Info | POST
exports.addRoomInfo = (req, res) => {
	const { roomType, roomCapacity, roomNumber, roomRate, booked } = req.body;

	let errors = [];
	let isBooked;

	if (!roomType || !roomCapacity || !roomNumber || !roomRate || !booked) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (errors.length > 0) {
		res.render("admin/addRoomInfo", {
			errors,
			roomType,
			roomCapacity,
			roomNumber,
			roomRate,
			booked,
			user: req.user,
			title: "Add Room Info",
			layout: "./layouts/adminLayout",
		});
	} else {
		// Check if the room exists in the database
		Room.findOne({ roomNumber: roomNumber }).then((roomNumber) => {
			if (roomNumber) {
				errors.push({
					msg: `A room with that number already exists!`,
				});
				res.render("admin/addRoomInfo", {
					errors,
					roomType,
					roomCapacity,
					roomNumber: req.body.roomNumber,
					roomRate,
					booked,
					user: req.user,
					title: "Add Room Info",
					layout: "./layouts/adminLayout",
				});
			} else {
				// Initialize room booking to false
				if (booked == "false") {
					isBooked = false;
				} else {
					isBooked = true;
				}

				const newRoom = new Room({
					roomType: roomType,
					roomCapacity: roomCapacity,
					roomNumber: req.body.roomNumber,
					roomRate: roomRate,
					isBooked: isBooked,
				});

				newRoom
					.save()
					.then(() => {
						req.flash(
							"success_msg",
							`Room information was saved successfully!`,
						);
						res.redirect("/admin/add-room-info");
					})
					.catch((err) => {
						req.flash(
							"error_msg",
							`An error occurred while saving the room...`,
						);
						res.redirect("/admin/add-room-info");
					});
			}
		});
	}
};
