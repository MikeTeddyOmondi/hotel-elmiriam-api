const bcryptjs = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");

const User = require("../models/User.js");
const Token = require("../models/Token.js");

const { REFRESH_SECRET, ACCESS_SECRET } = require("../config/config.js");

exports.ApiInfo = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Auth API",
    description: "Auth API | Version 1",
  });
};

exports.Register = async (req, res) => {
  const { username, email, id_number, password, userType } = req.body;

  if (!username || !email || !password || !id_number || !userType) {
    return res
      .status(500)
      .json({ success: false, message: `Please enter all fields!` });
  }

  const userExists = await User.findOne({ email });
  const idNumberExists = await User.findOne({ id_number });
  const usernameTaken = await User.findOne({ username });

  if (userExists) {
    return res.status(500).json({
      success: false,
      message: "User already exists!",
    });
  }

  if (idNumberExists) {
    return res.status(500).json({
      success: false,
      message: "ID number already exists!",
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
    id_number,
    userType,
  });

  user
    .save()
    .then((doc) => {
      const { password, isAdmin, userType, ...data } = doc._doc;
      res.status(201).json({ success: true, data: { user: data._id } });
    })
    .catch((err) => {
      console.log({ err });
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

  const isCorrect = await bcryptjs.compare(password, user.password);
  if (!isCorrect) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials!",
    });
  }

  const refreshToken = sign(
    {
      id: user._id,
      userType: user.userType,
      isAdmin: user.isAdmin,
    },
    REFRESH_SECRET,
    { expiresIn: "1w", header: { kid: KID } }
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
    { upsert: true }
  )
    .then(() => {
      const access_token = sign(
        {
          id: user._id,
          userType: user.userType,
          isAdmin: user.isAdmin,
        },
        ACCESS_SECRET,
        { expiresIn: "30m", header: { kid: KID } }
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
    const reqHeaders = req.headers["authorization"];
    if (!reqHeaders) {
      return res.status(401).json({
        success: false,
        data: {
          message: "Unauthenticated!",
        },
      });
    }

    const accessToken = reqHeaders.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        data: {
          message: "Unauthenticated!",
        },
      });
    }

    // const payload = verify(accessToken, ACCESS_SECRET);
    let payload;

    verify(accessToken, ACCESS_SECRET, (err, data) => {
      if (err) {
        // throw Error("Invalid token");
        return res.status(401).json({
          success: false,
          data: {
            message: "Invalid token",
          },
        });
      }
      payload = data;
    });

    const user = await User.findOne({ _id: payload.id });

    if (!user) {
      return res.status(403).json({
        success: false,
        data: {
          message: "Invalid token!",
        },
      });
    }

    const {
      id_number,
      password,
      isAdmin,
      isActive,
      isVerified,
      resetLink,
      ...data
    } = user._doc;

    res.status(200).json({
      success: true,
      data: {
        user: data,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: {
        message: `${err.message}`,
      },
    });
  }
};

exports.Accounts = async (req, res) => {
  try {
    const reqHeaders = req.headers["authorization"];
    if (!reqHeaders) {
      return res.status(401).send({
        success: false,
        data: {
          message: "Unauthenticated!",
        },
      });
    }

    const accessToken = reqHeaders.split(" ")[1];
    if (!accessToken) {
      return res.status(401).send({
        success: false,
        data: {
          message: "Unauthenticated!",
        },
      });
    }

    const payload = verify(accessToken, ACCESS_SECRET);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Invalid token!",
      });
    }

    const users = await User.find();

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          users: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: {
        message: `${err.message}`,
      },
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
        userType: payload.userType,
        isAdmin: payload.isAdmin,
      },
      ACCESS_SECRET,
      { expiresIn: "30m" }
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
        message: "Sign out successful!",
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
