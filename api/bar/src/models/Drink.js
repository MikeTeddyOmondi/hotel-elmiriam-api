const mongoose = require("mongoose");

const DrinkSchema = new mongoose.Schema(
	{
		drinkName: {
			type: String,
			required: true,
		},
		drinkCode: {
			type: String,
			unique: true,
			required: true,
		},
		typeOfDrink: {
			type: String,
			enum: ["spirit", "beer", "rtd", "wine", "water"],
			required: true,
		},
		uom: {
			type: String,
			enum: ["bottles", "crates"],
			required: true
		},
		buyingPrice: {
			type: Number,
			required: true,
		},
		sellingPrice: {
			type: Number,
			required: true,
		},
		stockQty: {
			type: Number,
			default: 0,
		},
		inStock: {
			type: Boolean,
			default: false,
		},
		imageUrl: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const Drink = mongoose.model("Drink", DrinkSchema);

module.exports = Drink;
