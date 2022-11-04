// Load User model
const BarPurchase = require("../models/BarPurchase");
const BarSale = require("../models/BarSale");
const Drink = require("../models/Drink");

// Image Uploader Service
const { upload } = require("../services/drinkImageUpload");

// Import Bar Service
const {
	saveDrink,
	searchDrink,
	fetchAllDrinks,
	saveBarPurchase,
	fetchBarPurchases,
	updateStockQuantity,
} = require("../services/bar.service");

// ______________________________________
// ADD BAR DRINKS INFORMATION
// ______________________________________

// Add Bar Drink | Menu Updates | GET
exports.getAddBarDrinkPanel = (req, res) => {
	res.render("admin/addBarDrink", {
		user: req.user,
		title: "Add Bar Drink | Menu",
		layout: "./layouts/adminLayout.ejs",
	});
};

// Add Bar Drink | Menu Updates | POST
exports.postAddBarDrinkPanel = (req, res) => {
	const { drinkName, drinkCode, typeOfDrink, uom, buyingPrice, sellingPrice, filString } =
		req.body;
	const image = req.file;
	console.log(image)

	// console.log({ drinkName, drinkCode, typeOfDrink, uom, buyingPrice, sellingPrice, image });

	let errors = [];

	if (
		!drinkName ||
		!drinkCode ||
		!typeOfDrink ||
		!uom ||
		!buyingPrice ||
		!sellingPrice ||
		!image
	) {
		errors.push({ msg: "Please enter all fields" });
	}

	if (errors.length > 0) {
		res.render("admin/addBarDrink", {
			errors,
			drinkName,
			drinkCode,
			typeOfDrink,
			uom,
			buyingPrice,
			sellingPrice,
			image,
			user: req.user,
			title: "Add Bar Drink | Menu",
			layout: "./layouts/adminLayout.ejs",
		});
	} else {
		// Check if the drink code exists in the database
		searchDrink(drinkCode).then(({ drinkCode }) => {
			if (drinkCode) {
				errors.push({
					msg: `That drink code already exists!`,
				});
				res.render("admin/addBarDrink", {
					errors,
					drinkName,
					drinkCode,
					typeOfDrink,
					uom,
					buyingPrice,
					sellingPrice,
					image,
					user: req.user,
					title: "Add Bar Drink | Menu",
					layout: "./layouts/adminLayout.ejs",
				});
			} else {
				const newDrink = new Drink({
					drinkName,
					drinkCode: req.body.drinkCode,
					typeOfDrink,
					uom,
					buyingPrice,
					sellingPrice,
					image: image.filename,
				});

				saveDrink(newDrink)
					.then(({ drinkCode }) => {
						req.flash(
							"success_msg",
							`Drink: ${drinkCode} information saved successfully!`,
						);
						res.redirect("/admin/add-bar-drink");
					})
					.catch((err) => {
						// console.log({err})
						req.flash(
							"error_msg",
							`An error occurred while saving the drink information...`,
						);
						res.redirect("/admin/add-bar-drink");
					});
			}
		});
	}
};

// ______________________________________
// ADD BAR PURCHASES INFORMATION
// ______________________________________

// Bar purchases | GET
exports.getBarPurchasesPanel = (req, res) => {
	// Fetching All Bar Purchases
	fetchBarPurchases()
		.then((purchases) => {
			// render the page
			res.render("admin/barPurchases", {
				purchases,
				user: req.user,
				title: "Bar Purchases",
				layout: "./layouts/adminLayout.ejs",
			});
		})
		.catch((err) => {
			// render the page
			res.render("admin/barPurchases", {
				user: req.user,
				title: "Bar Purchases",
				layout: "./layouts/adminLayout.ejs",
			});
		});
};

// Bar purchases - Add Bar Purchases Form | GET
exports.getBarPurchasesFormPanel = (req, res) => {
	// Initialize drink codes to display
	let drinkCodes = {};

	// fetch all drink codes from database
	fetchAllDrinks()
		.then((allDrinks) => {
			//console.log(allDrinks);

			drinkCodes = allDrinks.map(({ drinkCode }) => drinkCode);

			// render the page
			res.render("admin/barPurchasesForm", {
				drinkCodes,
				user: req.user,
				title: "Bar Purchases - Add List",
				layout: "./layouts/adminLayout.ejs",
			});
		})
		.catch((err) => {
			console.log(`> An error occurred while fetching data: ${err.message}`);
		});
};

// Bar purchases - Add Bar Purchases Form | POST
exports.postBarPurchasesFormPanel = (req, res) => {
	const { receiptNumber, product, quantity, supplier } = req.body;

	console.log({ receiptNumber, product, quantity, supplier });

	let errors = [];
	let drinks = {};
	let drinkCodes = {};
	let buyingPrice = 0;

	// fetch all drink codes from database
	fetchAllDrinks()
		.then((allDrinks) => {
			drinks = allDrinks;
			drinkCodes = allDrinks.map(({ drinkCode }) => drinkCode);

			// Bar Purchases Logic
			if (!receiptNumber || !product || !quantity || !supplier) {
				errors.push({ msg: "Please enter all fields" });
			}

			if (errors.length > 0) {
				res.render("admin/barPurchasesForm", {
					errors,
					quantity,
					availability,
					drinkCodes,
					user: req.user,
					title: "Bar Purchases | Add List",
					layout: "./layouts/adminLayout.ejs",
				});
			} else {
				// Get the buying price after specific product search
				searchDrink(product)
					.then((drinkFound) => {
						// Get the buying price of the product
						buyingPrice = drinkFound.buyingPrice;

						// Calculate Stock value
						let stockValue = buyingPrice * Number(quantity);

						const newPurchase = {
							receiptNumber,
							product: drinkFound._id,
							quantity,
							stockValue,
							supplier,
						};

						// Drink to update stock quantity & inStock status
						const drinkToUpdate = drinkFound;

						// Save Bar Purchase
						saveBarPurchase(newPurchase)
							.then((purchaseMade) => {
								console.log(
									`> [Controller Logs] New Bar Purchase: ${purchaseMade}`,
								);
								req.flash(
									"success_msg",
									`Saved the new bar stock purchase successfully! `,
								);
							})
							.then(() => {
								// Update Stock Quantity
								updateStockQuantity(drinkToUpdate, quantity)
									.then(() => {
										req.flash(
											"success_msg",
											`Updated the drink stocks successfully!`,
										);
										return res.redirect("/admin/bar-purchases/add");
									})
									.catch((err) => {
										throw err;
									});
							})
							.catch((err) => {
								console.log(
									`> [Controller Error] An error occurred while saving the data: ${err.message}`,
								);
								req.flash(
									"error_msg",
									`An error occurred while saving the data!`,
								);
								return res.redirect("/admin/bar-purchases/add");
							});
					})
					.catch((err) => {
						console.log(
							`> [Controller Error] Product with that code was not found!!!...`,
						);

						req.flash(
							"error_msg",
							`Product with this code ${product} was not found!`,
						);
						return res.redirect("/admin/bar-purchases/add");
					});
			}
		})
		.catch((err) => {
			console.log(
				`> [Controller Error] An error occurred while fetching data: ${err.message}`,
			);
			req.flash("error_msg", `An error occurred while fetching data!`);
			return res.redirect("/admin/bar-purchases/add");
		});
};
