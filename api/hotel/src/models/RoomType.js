const mongoose = require("mongoose");

const RoomTypeSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		rate: {
			type: Number,
			required: true,
		},
		capacity: {
			type: Number,
			required: true,
		},
		roomType: {
			type: String,
			enum: ["single", "double"],
			unique: true,
			required: true,
		},
		rooms: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Room",
			},
		],
		unavailableDates: { type: [Date] },
	},
	{ timestamps: true },
);

RoomTypeSchema.virtual("room", {
	ref: "Room",
	localField: "rooms",
	foreignField: "_id",
	justOne: false,
});

const RoomType = mongoose.model("RoomType", RoomTypeSchema);

module.exports = RoomType;
