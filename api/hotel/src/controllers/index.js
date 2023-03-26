// const bcryptjs = require("bcryptjs");
// const { sign, verify } = require("jsonwebtoken");
const { createError } = require("../utils/error");
const { getDatesInRange } = require("../utils/getDateRange");

const Customer = require("../models/Customer.js");
const RoomType = require("../models/RoomType.js");
const Booking = require("../models/Booking.js");
const Invoice = require("../models/Invoice.js");
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
	updateRoomTypeAvailability,
	updateRoomStatus,
	fetchOneRoom,
	fetchAllRooms,
	checkRoomTypeCapacity,
} = require("../services/hotel.service");

// const { REFRESH_SECRET, ACCESS_SECRET } = require("../config/config.js");

exports.ApiInfo = async (req, res, next) => {
	try {
		return res.status(200).json({
			success: true,
			message: "Hotel API",
			description: "Hotel API | Version 1",
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

// Room Booking List View | Search Customer by ID Number in query params | GET
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
// exports.addBookings = async (req, res, next) => {
// 	// Destructure the request body
// 	const {
// 		customerIdNumber,
// 		numberAdults,
// 		numberKids,
// 		roomType,
// 		check_in_date,
// 		check_out_date,
// 	} = req.body;

// 	const { access_token } = req;
// 	let currentUser = {};

// 	const resp = await fetch("http://0.0.0.0:8000/api/v1/user", {
// 		method: "get",
// 		headers: {
// 			authorization: `Bearer ${access_token}`,
// 		},
// 	});
// 	const { success, data } = await resp.json();

// 	if (!success) {
// 		return currentUser;
// 	}
// 	const { user } = data;
// 	currentUser = { ...user };
// 	console.log(`> currentUser: ${currentUser._id}`);

// 	// Search for customer with provided ID number
// 	let customerFound = await searchCustomer(customerIdNumber);

// 	if (customerFound === null) {
// 		return next(createError(500, `No customer found with that ID number`));
// 	}

// 	// Get the customer's object ID
// 	const customerId = customerFound._id;

// 	// Find room given the room type
// 	const roomTypeFound = await findRoomType(roomType);
// 	console.log("> roomTypeFound: ", roomTypeFound);

// 	const alldates = getDatesInRange(check_in_date, check_out_date);

// 	const totalPeople = parseInt(numberKids) + parseInt(numberAdults);
// 	console.log("> totalPeople: ", totalPeople);

// 	const roomTypeID = roomTypeFound._id;

// 	// Check if the customer has not yet booked
// 	// Check if the number of booked room type is equal =>
// 	// to all the number of rooms of that type rooms created

// 	let roomsBooked = 0;
// 	let allBookingsInfo = [];

// 	const countRooms = async (objectID) => {
// 		let roomsCount = 0;
// 		return (roomsCount = await Booking.countDocuments({ roomType: objectID }));
// 	};

// 	try {
// 		let singleRoomsBooked = 0;
// 		let doubleRoomsBooked = 0;

// 		const allBookings = await fetchBookings();
// 		// console.log("> allBookings: ", allBookings);

// 		allBookings.map((booking) => {
// 			let datesBooked = getDatesInRange(
// 				booking.checkInDate,
// 				booking.checkOutDate,
// 			);
// 			let info = {
// 				customerIDNo: booking.customer.id_number,
// 				roomTypeBooked: booking.roomType.roomType,
// 				datesBooked,
// 			};
// 			allBookingsInfo.push(info);
// 		});

// 		let roomsCount = 0;
// 		if (roomTypeFound.roomType === "single") {
// 			singleRoomsBooked = await countRooms(roomTypeFound._id);
// 			console.log("> singleRooms: ", singleRoomsBooked);
// 			roomsBooked = singleRoomsBooked;
// 		} else if (roomTypeFound.roomType === "double") {
// 			doubleRoomsBooked = await countRooms(roomTypeFound._id);
// 			console.log("> doubleRooms: ", doubleRoomsBooked);
// 			roomsBooked = doubleRoomsBooked;
// 		}
// 	} catch (err) {
// 		console.log(err);
// 		return next(createError(500, `Failed to fetch all bookings`));
// 	}

// 	console.log("> allBookingsInfo", allBookingsInfo);
// 	console.log("> roomsBooked", roomsBooked);

// 	// No. of rooms: Single / Double
// 	let totalRooms = 0;

// 	if (roomTypeFound.roomType === "single") {
// 		const numberOfSingleRooms = roomTypeFound.rooms.length;
// 		console.log("> singleRooms: ", numberOfSingleRooms);
// 		totalRooms = numberOfSingleRooms;
// 	} else if (roomTypeFound.roomType === "double") {
// 		const numberOfDoubleRooms = roomTypeFound.rooms.length;
// 		console.log("> doubleRooms: ", numberOfDoubleRooms);
// 		totalRooms = numberOfDoubleRooms;
// 	}

// 	console.log("> totalRooms: ", totalRooms);

// 	if (roomsBooked > totalRooms) {
// 		return next(createError(500, "No rooms available for booking"));
// 	}

// 	const isCustomerBooked = (listOfIDNumbers) => {
// 		// const isFound = listOfIDNumbers.some((idNumber) =>
// 		// 	listOfIDNumbers.includes(idNumber),
// 		// );
// 		const data = {
// 			customerIDNo: customerIdNumber,
// 			roomTypeBooked: roomType,
// 			datesBooked: getDatesInRange(
// 				check_in_date,
// 				check_out_date,
// 			)
// 		};

// 		const isFound = allBookingsInfo.includes(data);
// 		return isFound;
// 	};

// 	let hasCustomerBooked = isCustomerBooked(allBookingsInfo);
// 	console.log("> hasCustomerBooked: ", hasCustomerBooked);

// 	if (hasCustomerBooked) {
// 		return next(createError(500, "Customer already booked"));
// 	}

// 	// Reservation

// 	// Check room if its available
// 	// let isRoomAvailable = await checkRoomAvailability(roomFound, alldates); // Service to be created
// 	const isAvailable = (roomType) => {
// 		const isFound = roomType.reservations.unavailableDates.some((date) =>
// 			alldates.includes(new Date(date).getTime()),
// 		);

// 		return !isFound;
// 	};

// 	let isRoomAvailable = isAvailable(roomTypeFound);
// 	console.log("> isRoomAvailable: ", isRoomAvailable);

// 	// check room capacity
// 	const roomTypeMaxCapacity = await checkRoomTypeCapacity(roomTypeFound);
// 	console.log("> roomTypeMaxCapacity: ", roomTypeMaxCapacity);

// 	// If room is available proceed to reservation
// 	if (!isRoomAvailable) {
// 		return next(createError(500, "Room not available"));
// 	}

// 	if (roomTypeMaxCapacity >= totalPeople) {
// 		try {
// 			const bookingDetails = {
// 				customerId,
// 				numberKids,
// 				numberAdults,
// 				roomType: roomTypeID,
// 				check_in_date,
// 				check_out_date,
// 			};
// 			console.log("> bookingDetails: ", bookingDetails);

// 			// Room Type Rate
// 			const rate = roomTypeFound.rate;

// 			// Create Reservation
// 			const { newBooking, newInvoice } = await saveBookingAndInvoice(
// 				bookingDetails,
// 				rate,
// 				customerId,
// 			);
// 			// console.log("> booking: ", booking);
// 			console.log("> Ok");

// 			// Updated Room Availability
// 			const updated = await updateRoomTypeAvailability(
// 				roomTypeFound._id,
// 				alldates,
// 				newBooking._id,
// 			);
// 			console.log("> updated: ", updated);

// 			if (updated) {
// 				return res.status(200).json({
// 					success: true,
// 					data: {
// 						newBooking,
// 						newInvoice,
// 					},
// 				});
// 			}
// 		} catch (error) {
// 			console.log(error);
// 			return next(createError(500, `Error: ${error.message}`));
// 		}
// 	} else {
// 		return next(createError(500, "Room capacity exceeded"));
// 	}
// };
exports.addBookings = async (req, res, next) => {
	try {
		const {
			customerId,
			numberAdults,
			numberKids,
			roomType,
			checkInDate,
			checkOutDate,
		} = req.body;

		const { access_token } = req;
		let currentUser = {};

		const resp = await fetch("http://0.0.0.0:8000/api/v1/user", {
			method: "get",
			headers: {
				authorization: `Bearer ${access_token}`,
			},
		});
		const { success, data } = await resp.json();

		if (!success) {
			return currentUser;
		}
		const { user } = data;
		currentUser = { ...user };
		console.log(`> currentUser: ${currentUser._id}`);

		// Check if the customer exists
		const customer = await Customer.findOne({ id_number: String(customerId) });
		if (!customer) {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Check if the room type exists
		const roomTypeDoc = await RoomType.findOne({ roomType });
		if (!roomTypeDoc) {
			return res.status(404).json({ error: "Room type not found" });
		}

		// Check if there are available rooms
		const availableRooms = await Room.find({ isBooked: false });
		// console.log({ availableRooms });
		if (availableRooms.length < 1) {
			return res.status(404).json({ error: "No available rooms" });
		}

		// Select a random available room
		const roomIndex = Math.floor(Math.random() * availableRooms.length);
		const room = availableRooms[roomIndex];
		// console.log({ room });

		// Find the room type based on the random room chosen
		const { _id } = await RoomType.findOne({ rooms: room._id });
		const roomTypeFound = _id;
		console.log({ roomTypeFound });

		// Create a new booking
		const booking = new Booking({
			customer: customer,
			numberAdults: numberAdults,
			numberKids: numberKids,
			roomType: roomTypeFound,
			checkInDate: checkInDate,
			checkOutDate: checkOutDate,
		});

		// Update the random room chosen
		room.isBooked = true;
		// await room.save();
		console.log({ room });

		// Save the booking
		// await booking.save();
		console.log({ booking });

		// Create a new invoice
		const diffinTime = Math.abs(new Date(checkOutDate) - new Date(checkInDate));
		const diffinDays = Math.ceil(diffinTime / (1000 * 60 * 60 * 24));
		console.log({ diffinDays });

		const subTotalCost = roomTypeDoc.rate * diffinDays;
		const vat = 0.16 * Number(subTotalCost);
		const totalCost = subTotalCost + vat;

		const invoice = new Invoice({
			bookingRef: booking._id,
			subTotalCost: subTotalCost,
			vat: vat,
			totalCost: totalCost,
		});

		// await invoice.save();
		console.log({ invoice });

		res.status(201).json({
			message: "Room booked successfully",
			data: { booking: booking, room: room, invoice: invoice },
		});
	} catch (error) {
		return next(createError(500, `${error}`));
	}
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
		const createdRoomId = newRoom._id;
		// console.log("> createdRoomId: ", createdRoomId);

		await RoomType.updateOne(
			{ _id: roomtypeid },
			{
				$push: { rooms: createdRoomId },
			},
		)
			.then(async () => {
				const createdRoom = await newRoom.save();

				res.status(200).json({
					success: true,
					data: createdRoom,
				});
			})
			.catch((err) => {
				console.log("> Error: ", err.message);
				return next(createError(500, "Error creating room"));
			});
	} catch (err) {
		console.log("> Error: ", err.message);
		return next(createError(500, "Error creating room"));
	}
};

// Room Info | POST Deprecated
// exports.addRoomInfo = (req, res) => {
// 	const { roomType, roomCapacity, roomNumber, roomRate, booked } = req.body;

// 	let errors = [];
// 	let isBooked;

// 	if (!roomType || !roomCapacity || !roomNumber || !roomRate || !booked) {
// 		errors.push({ msg: "Please enter all fields" });
// 	}

// 	if (errors.length > 0) {
// 		res.render("admin/addRoomInfo", {
// 			errors,
// 			roomType,
// 			roomCapacity,
// 			roomNumber,
// 			roomRate,
// 			booked,
// 			user: req.user,
// 			title: "Add Room Info",
// 			layout: "./layouts/adminLayout",
// 		});
// 	} else {
// 		// Check if the room exists in the database
// 		Room.findOne({ roomNumber: roomNumber }).then((roomNumber) => {
// 			if (roomNumber) {
// 				errors.push({
// 					msg: `A room with that number already exists!`,
// 				});
// 				res.render("admin/addRoomInfo", {
// 					errors,
// 					roomType,
// 					roomCapacity,
// 					roomNumber: req.body.roomNumber,
// 					roomRate,
// 					booked,
// 					user: req.user,
// 					title: "Add Room Info",
// 					layout: "./layouts/adminLayout",
// 				});
// 			} else {
// 				// Initialize room booking to false
// 				if (booked == "false") {
// 					isBooked = false;
// 				} else {
// 					isBooked = true;
// 				}

// 				const newRoom = new Room({
// 					roomType: roomType,
// 					roomCapacity: roomCapacity,
// 					roomNumber: req.body.roomNumber,
// 					roomRate: roomRate,
// 					isBooked: isBooked,
// 				});

// 				newRoom
// 					.save()
// 					.then(() => {
// 						req.flash(
// 							"success_msg",
// 							`Room information was saved successfully!`,
// 						);
// 						res.redirect("/admin/add-room-info");
// 					})
// 					.catch((err) => {
// 						req.flash(
// 							"error_msg",
// 							`An error occurred while saving the room...`,
// 						);
// 						res.redirect("/admin/add-room-info");
// 					});
// 			}
// 		});
// 	}
// };

// READ All Rooms Info | GET
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

// READ All Room Types | GET
exports.allRoomTypes = async (req, res, next) => {
	// Fetching All Room Types
	try {
		const roomTypes = await RoomType.find({})
			.populate({ path: "rooms", model: "Room" })
			.populate({
				path: "reservations",
				populate: {
					path: "bookingRef",
					model: "Booking",
				},
			});

		res.status(200).json({
			success: true,
			data: { roomTypes },
		});
	} catch (error) {
		next(error);
	}
};

// UPDATE Room Type Info | PUT
exports.updateRoomType = async (req, res, next) => {
	// Fetching All Room Types
	try {
		const roomTypes = await RoomType.find({});

		res.status(200).json({
			success: true,
			data: { roomTypes },
		});
	} catch (error) {
		next(error);
	}
};

// READ One Room Info | GET
exports.fetchOneRoom = async (req, res, next) => {
	const { roomid } = req.params;
	const room = await fetchOneRoom(roomid);

	if (room) {
		res.status(200).json({
			success: true,
			data: { room },
		});
	} else {
		return next(createError(404, "Room not found"));
	}
};

// READ One Room | GET - Using Room Number
exports.searchRoom = async (req, res, next) => {
	// try {
	// 	const rooms = await Room.find({roomNumbers.number});
	// 	res.status(200).json(rooms);
	// } catch (err) {
	// 	next(err);
	// }
};
