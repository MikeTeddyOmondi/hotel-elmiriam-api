// Lib imports
const { DateTime } = require("luxon");

// Models
const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Booking Logic | Customer
module.exports = {
	saveCustomer: async (customer) => {
		// Logic here
		const { firstname, lastname, email, id_number, phone_number } = customer;

		let newCustomer = new Customer({
			firstname,
			lastname,
			email,
			id_number,
			phone_number,
		});

		await newCustomer
			.save()
			.then(() => {
				console.log("> Saved a new customer!");
			})
			.catch((err) => {
				console.log("> [Booking Service] error - ", err.message);
				return err;
			});
		return newCustomer._id;
	},
	fetchAllCustomers: async () => {
		// Logic here
		let customers;

		await Customer.find({})
			.then((allCustomers) => {
				// All Customers
				customers = allCustomers;
			})
			.catch((err) => {
				console.log(
					`> [Booking Service] An error occurred while fetching data - ${err.message}`,
				);
				return err;
			});

		return customers;
	},
	searchCustomer: async (customerID) => {
		// Searching for customer given the ID number
		let customer;

		await Customer.findOne({ id_number: String(customerID) })
			.then((customerFound) => {
				// console.log(`> CustomerFound: ${customerFound._id}`);
				customer = customerFound;
			})
			.catch((err) => {
				// console.log(`> [Booking Service] error - ${err}`);
				return err;
			});
		return customer;
	},
	findCustomer: async (objectID) => {
		// Searching for customer given the unique Object ID
		let customer;

		await Customer.findOne({ _id: objectID })
			.then((customerFound) => {
				console.log(`> Customer Found: ${customerFound._id}`);
				customer = customerFound;
			})
			.catch((err) => {
				console.log(`> [Booking Service] error - ${err.message}`);
				return err;
			});

		return customer;
	},
	fetchAllRooms: async () => {
		let rooms;

		await Room.find({})
			.then((allRooms) => {
				// All Rooms
				rooms = allRooms;
			})
			.catch((err) => {
				console.log(
					`> [Booking Service] An error occurred while fetching data - ${err.message}`,
				);
				return err;
			});

		return rooms;
	},
	fetchOneRoom: async (id) => {
		let room = null;

		try {
			room = await Room.findById(id);
			console.log(room);
			return room;
		} catch (err) {
			console.log(err);
			return err;
		}
	},
	findRoom: async (roomNumber) => {
		// Logic here
		let roomFound;

		await Room.findOne({ roomNumber })
			.then((room) => {
				// console.log(`> Room Found: ${room._id}`);
				roomFound = room;
			})
			.catch((err) => {
				console.log(`> [Booking Service] error - ${err.message}`);
				return err;
			});

		return roomFound;
	},
	findRoomType: async (roomType) => {
		// Logic here
		let roomFound;

		await Room.findOne({ roomNumber })
			.then((room) => {
				// console.log(`> Room Found: ${room._id}`);
				roomFound = room;
			})
			.catch((err) => {
				console.log(`> [Booking Service] error - ${err.message}`);
				return err;
			});

		return roomFound;
	},
	saveBooking: async (booking) => {
		// Booking Service Logic
		const {
			customerId,
			numberAdults,
			numberKids,
			roomRate,
			roomID,
			check_in_date,
			check_out_date,
		} = booking;

		// Total number of occupants
		const numberOccupants = parseInt(numberAdults) + parseInt(numberKids);

		// Calculate the number of days to stay in the room
		const days = DateTime.fromISO(check_out_date)
			.diff(DateTime.fromISO(check_in_date), "days")
			.toObject().days;

		// console.log(`Accomodation Duration = ${days} days`);

		// Initialized Variables
		const vatPercentage = 16 / 100;
		const subTotal = numberOccupants * parseInt(roomRate) * days;
		const VAT = vatPercentage * subTotal;
		const total = subTotal + VAT;

		let newBooking = new Booking({
			customer: customerId,
			numberAdults,
			numberKids,
			roomsBooked: roomID,
			checkInDate: check_in_date,
			checkOutDate: check_out_date,
			vat: VAT,
			subTotalCost: subTotal,
			totalCost: total,
		});

		newBooking
			.save()
			.then(() => {
				console.log("Saved a new booking!");
			})
			.catch((err) => {
				console.log("> [Booking Service] error - ", err.message);
				return err;
			});
		return newBooking;
	},
	fetchBookings: async () => {
		// Logic here
		let allBookings = {};

		await Booking.find({})
			.populate("customer")
			.populate("roomBooked")
			.then((bookingsMade) => {
				// console.log(`Bookings made: ${bookingsMade}`);
				allBookings = bookingsMade;
				return allBookings;
			})
			.catch((err) => {
				console.log(
					`> [Booking Service] An error occurred while fetching data - ${err.message}`,
				);
				allBookings = {};
				return err;
			});

		return allBookings;
	},
	updateRoomStatus: async (roomNumber, boolean) => {
		if (boolean == true) {
			await Room.findOneAndUpdate(
				{ roomNumber },
				{ isBooked: true },
				(err, doc, res) => {
					if (err) return console.log(err.message);
					console.log({ doc });
				},
			).clone();
		} else if (boolean == false) {
			await Room.findOneAndUpdate(
				{ roomNumber },
				{ isBooked: false },
				(err, doc, res) => {
					if (err) return console.log(err.message);
					console.log({ doc });
				},
			).clone();
		} else {
			return console.log(
				"> [Service error} No args provided: (roomNumber, boolean)",
			);
		}

		return;
	},
	checkRoomAvailability: async (roomFound, requestedDates) => {
		let availability;

		const isAvailable = (room) => {
			const isFound = room.roomNumbers.unavailableDates.some((date) =>
				requestedDates.includes(new Date(date).getTime()),
			);

			return !isFound;
		};

		return (availability = isAvailable(roomFound));
	},
	updateRoomAvailability: async (roomID, dates) => {
		// roomID => req.params.id
		let updated = false;

		try {
			await Room.updateOne(
				{ _id: roomID },
				{
					$push: {
						unavailableDates: dates,
					},
				},
			);
			return (updated = true);
		} catch (err) {
			console.log(err);
			return (updated = false);
		}
	},
};
