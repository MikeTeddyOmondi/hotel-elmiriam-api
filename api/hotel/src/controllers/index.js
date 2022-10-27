// const bcryptjs = require("bcryptjs");
// const { sign, verify } = require("jsonwebtoken");

const Customer = require("../models/Customer.js");
const RoomType = require("../models/RoomType.js");
const Room = require("../models/Room.js");

// Import Hotel Service
const {
	saveCustomer,
	fetchAllCustomers,
	fetchBookings,
	searchCustomer,
	findCustomer,
	findRoom,
	findRoomType,
	saveBookingAndInvoice,
	checkRoomAvailability,
	updateRoomAvailability,
	updateRoomStatus,
	fetchOneRoom,
	fetchAllRooms,
} = require("../services/hotel.service");

// const { REFRESH_SECRET, ACCESS_SECRET } = require("../config/config.js");

exports.ApiInfo = async (req, res, next) => {
	try {
		return res.status(200).json({
			success: true,
			message: "Hotel API",
		});
	} catch (error) {
		next(error);
	}
};

// ________________________________________________
// CUSTOMERS INFORMATION
// ________________________________________________

// Add Customers List View | GET
exports.getAllCustomers = async (req, res, next) => {
	try {
		const customers = await fetchAllCustomers();

		res.status(200).json({
			success: true,
			data: { customers },
		});
	} catch (error) {
		next(error);
	}
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
exports.getAllBookings = async (req, res) => {
	// Fetching All Bookings Made
	try {
		const bookings = await fetchBookings();

		res.status(200).json({
			success: true,
			data: { bookings },
		});
	} catch (error) {
		next(error);
	}
};

// Room Booking List View | Search Customer by ID Number in query paramas | GET
exports.searchCustomer = async (req, res) => {
	let errors = {};
	const { idnumber } = req.params;

	// Search customer with the id
	await searchCustomer(idnumber)
		.then((customerFound) => {
			if (!customerFound) {
				return res.status(500).json({
					success: true,
					data: {
						msg: "No customer found with that ID number",
					},
				});
			}
			console.log(`> Customer ID: ${customerFound._id}`);
			console.log(`> Customer Details: ${customerFound}`);
			// customerID = customerFound._id;
			// req.session.customerID = customerID;

			return res.status(200).json({
				success: true,
				data: { customer: customerFound._doc },
			});
		})
		.catch((err) => {
			console.log(`> [Controller] error - ${err.message}`);

			// req.flash(
			// 	"error_msg",
			// 	`There is no customer with this ID number: ${id_number}...`,
			// );

			// return res.redirect("/admin/bookings/search-customer");

			return res.status(500).json({
				success: false,
				data: err,
			});
		});

	// res.redirect("/admin/bookings/booking-details");
};

// Admin Panel - POST | Bookings Details Page
exports.addBookings = async (req, res) => {
	let errors = {};

	// Destructure the request body
	const {
		customerIdNumber,
		numberAdults,
		numberKids,
		roomType,
		check_in_date,
		check_out_date,
	} = req.body;

	// Search for customer with provided ID number
	let customerFound = await searchCustomer(customerIdNumber);

	if (!customerFound) {
		return res.status(500).json({
			success: false,
			data: {
				msg: "No customer found with that ID number",
			},
		});
	}

	// Get the customer's object ID
	const customerId = customerFound._id;

	// Find room given the room number
	const roomTypeFound = await findRoomType(roomType);
	console.log("> roomTypeFound: ", roomTypeFound);

	const getDatesInRange = (startDate, endDate) => {
		const start = new Date(startDate);
		const end = new Date(endDate);

		const date = new Date(start.getTime());

		const dates = [];

		while (date <= end) {
			dates.push(new Date(date).getTime());
			date.setDate(date.getDate() + 1);
		}

		return dates;
	};

	const alldates = getDatesInRange(check_in_date, check_out_date);

	// Check room if its available
	// let isRoomAvailable = await checkRoomAvailability(roomFound, alldates);
	const isAvailable = (roomType) => {
		const isFound = roomType.reservations.unavailableDates.some((date) =>
			alldates.includes(new Date(date).getTime()),
		);

		return !isFound;
	};
	let isRoomAvailable = isAvailable(roomTypeFound);
	const roomTypeID = roomTypeFound._id;

	const bookingDetails = {
		customerId,
		numberKids,
		numberAdults,
		roomTypeID,
		check_in_date,
		check_out_date,
	};

	if (isAvailable(roomTypeFound)) {
		const updated = updateRoomAvailability(roomTypeFound._id, alldates);

		if (updated) {

			const totalPeople = parseInt(numberKids) + parseInt(numberAdults)
			if (roomTypeFound.capacity === totalPeople) {


				// Make the reservation & Generate Invoice
				const reservation = await saveBookingAndInvoice(bookingDetails);
				
			}

			return res.status(200).json({
				success: true,
				data: {},
			});
		} else {
			return res.status(500).json({
				success: false,
				data: {
					msg: "Error updating room availability",
				},
			});
		}
	} else {
		return res.status(500).json({
			success: false,
			data: {
				msg: "Room not available",
			},
		});
	}

	// Save the hotel booking

	// Initialize booking, customer & room details

	// Booking Logic

	// Save booking

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

// CREATE Room Type Info | POST
exports.createRoomType = async (req, res, next) => {
	const newRoomType = new RoomType(req.body);

	try {
		const createdRoomType = await newRoomType.save();
		res.status(200).json({
			success: true,
			data: createdRoomType,
		});
	} catch (err) {
		next(err);
	}
};

// CREATE Room Info | POST
exports.createRoom = async (req, res, next) => {
	const { roomtypeid } = req.params;
	const newRoom = new Room(req.body);

	try {
		const createdRoom = await newRoom.save();
		try {
			await RoomType.findByIdAndUpdate(roomtypeid, {
				$push: { rooms: createdRoom._id },
			});
		} catch (err) {
			next(err);
		}
		res.status(200).json({
			success: true,
			data: createdRoom,
		});
	} catch (err) {
		next(err);
	}
};

// Room Info | POST Deprecated
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

exports.fetchAllRooms = (req, res) => {
	let errors = {};

	// Fetching All Bookings Made
	fetchAllRooms()
		.then((rooms) => {
			res.status(200).json({
				success: true,
				data: { rooms },
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

exports.allRoomTypes = async (req, res, next) => {
	// Fetching All Room Types
	try {
		const roomTypes = await RoomType.find({}).populate("rooms");

		res.status(200).json({
			success: true,
			data: { roomTypes },
		});
	} catch (error) {
		next(error);
	}
};

exports.fetchOneRoom = async (req, res, next) => {
	const { roomid } = req.params;
	// console.log(roomid);
	// Fetching All Bookings Made
	try {
		const room = await fetchOneRoom(roomid);
		// console.log(room)

		res.status(200).json({
			success: true,
			data: { room },
		});
	} catch (error) {
		next(error);
	}
};

exports.searchRoom = async (req, res, next) => {
	// try {
	// 	const rooms = await Room.find({roomNumbers.number});
	// 	res.status(200).json(rooms);
	// } catch (err) {
	// 	next(err);
	// }
};