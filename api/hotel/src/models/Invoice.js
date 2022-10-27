const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
	{
		bookingRef: {
			type: mongoose.Types.ObjectId,
			ref: "Booking",
		},
		vat: {
			type: Number,
			required: true,
		},
		subTotalCost: {
			type: Number,
			required: true,
		},
		totalCost: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true },
);

InvoiceSchema.virtual("booking", {
	ref: "Booking",
	localField: "booking",
	foreignField: "_id",
	justOne: true,
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;
