const bcryptjs = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");

const User = require("../models/User.js");
const Token = require("../models/Token.js");

const { REFRESH_SECRET, ACCESS_SECRET, KID } = require("../config/config.js");

exports.ApiInfo = async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Auth API",
	});
};

exports.Register = async (req, res) => {
	const { username, email, password } = req.body;

	const userExist = await User.findOne({ email });
	const usernameTaken = await User.findOne({ username });

	if (userExist) {
		return res.status(500).json({
			success: false,
			message: "User already exists!",
		});
	}

	if (usernameTaken) {
		return res.status(500).json({
			success: false,
			message: "Username already taken!",
		});
	}

	const user = await User({
		username,
		email,
		password: await bcryptjs.hash(password, 12),
	});

	user
		.save()
		.then((doc) => {
			const { password, ...data } = doc._doc;
			res.status(201).json({ success: true, data: { user: data._id } });
		})
		.catch((err) => {
			return res
				.status(500)
				.json({ success: false, message: `Error saving user!` });
		});
};

exports.Login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		return res.status(400).json({
			success: false,
			message: "Invalid credentials!",
		});
	}

	if (!bcryptjs.compare(password, user.password)) {
		return res.status(400).json({
			success: false,
			message: "Invalid credentials!",
		});
	}

	const refreshToken = sign(
		{
			id: user._id,
		},
		REFRESH_SECRET,
		{ expiresIn: "1w", header: { kid: KID } },
	);

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});

	const expired_at = new Date();
	expired_at.setDate(expired_at.getDate() + 7);

	// Upsert the refreshToken instead of saving
	// to avoid duplicate tokens with the same id

	await Token.updateOne(
		{
			user_id: user._id,
		},
		{
			$set: { token: refreshToken, expired_at },
		},
		{ upsert: true },
	)
		.then(() => {
			const access_token = sign(
				{
					id: user._id,
				},
				ACCESS_SECRET,
				{ expiresIn: "30m", header: { kid: KID } },
			);

			res.status(200).json({
				success: true,
				data: {
					token: access_token,
				},
			});
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({
				success: false,
				message: "Error signing in!",
			});
		});
};

exports.AuthenticatedUser = async (req, res) => {
	try {
		const accessToken = req.header("Authorization")?.split(" ")[1] || "";

		const payload = verify(accessToken, ACCESS_SECRET);

		if (!payload) {
			return res.status(401).send({
				message: "Unauthenticated!",
			});
		}

		const user = await User.findOne(payload._id);

		if (!user) {
			return res.status(401).send({
				message: "Unauthenticated!",
			});
		}

		const { password, ...data } = user._doc;

		res.status(200).json({
			success: true,
			data: {
				user: data,
			},
		});
	} catch (err) {
		return res.status(401).send({
			success: false,
			message: "Unauthenticated!",
		});
	}
};

exports.Refresh = async (req, res) => {
	try {
		const refreshToken = req.cookies["refreshToken"];

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				message: "Unauthenticated!",
			});
		}
		const payload = verify(refreshToken, REFRESH_SECRET);

		if (!payload) {
			return res.status(401).json({
				success: false,
				message: "Unauthenticated!",
			});
		}

		const refreshtokenSaved = await Token.findOne({
			user_id: payload.id,
		});

		if (!refreshtokenSaved) {
			return res.status(401).json({
				success: false,
				message: "Unauthenticated!",
			});
		}

		const token = sign(
			{
				id: payload.id,
			},
			ACCESS_SECRET,
			{ expiresIn: "90s" },
		);

		res.status(200).json({
			success: true,
			data: {
				token,
			},
		});
	} catch (err) {
		console.log(err);
		return res.status(401).json({
			success: false,
			message: "Unauthenticated!",
		});
	}
};

exports.Logout = async (req, res) => {
	const refreshToken = req.cookies["refreshToken"];

	try {
		if (refreshToken) {
			await Token.findOneAndDelete({ token: refreshToken });

			res.cookie("refreshToken", "", { maxAge: 0 });

			res.status(200).json({
				success: true,
				message: "Sign out successfull!",
			});
		} else {
			res.status(500).json({
				success: false,
				message: "Unauthenticated!",
			});
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({
			success: false,
			message: "Error signing out!",
		});
	}
};
