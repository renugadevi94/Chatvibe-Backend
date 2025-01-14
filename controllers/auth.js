const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Token = require("../model/tokenModel");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  EMAIL_ADDRESS,
  APP_PASSWORD,
  FEURL,
  SECRET,
} = require("../utils/config");

// Generate Token
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, username: user.email }, SECRET, {
    expiresIn: "1d",
  });
};

//getting token

const getTokenFrom = (req) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.startsWith("bearer ")) {
    return authorization.replace("bearer ", "");
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    //getting data from FE
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      location,
      occupation,
      contactNo,
    } = req.body;

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !picturePath ||
      !location ||
      !occupation ||
      !contactNo
    ) {
      res.status(400).json({ message: "all fields are mandotary" });
      return;
    }

    // Check if user email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    //generating random string

    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const link = `${FEURL}/confirm/${randomString}`;

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      picturePath,
      location,
      occupation,
      contactNo,
      verifyToken: randomString,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    //sending email for Confirm account

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_ADDRESS,
        pass: APP_PASSWORD,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
        from: `"Renugadevi" <${APP_PASSWORD}>`,
        to: user.email,
        subject: "Confirm account",
        text: link,
      });
    };

    sendMail();

    res.status(201).json({
      message: `${user.firstName} Account Created, Please Check your Email`,
    });
    //
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Confirm User
const confirmUser = async (req, res) => {
  try {
    //getting data from FE using ID params
    const verifyToken = req.params.id;

    const matchedUser = await User.findOne({ verifyToken });

    //if user not found throw error
    if (matchedUser === null || matchedUser.verifyToken === "") {
      return res.status(400).json({ message: "Account Already activated" });
    }

    //confirming and updating account
    matchedUser.isVerified = true;

    matchedUser.verifyToken = "";

    await User.findByIdAndUpdate(matchedUser._id, matchedUser);

    //sending data to FE
    res.status(201).json({
      message: `${matchedUser.firstName} account has been verified successfully`,
    });

    //
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    //getting data from FE

    const { email, password } = req.body;

    // Validate Request
    if (!email || !password) {
      res.status(400).json({ message: "all fields are mandotary" });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "user not exist/Please Sign-up" });
    }

    // User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    // if user password does not match send error
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: "password incorrect" });
    }

    // if user not verified send error
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Account not verfied, kindly check your Email" });
    }

    //   Generate Token
    const token = generateToken(user);

    //sending data to FE

    res.status(200).json({ token, user });
    //
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//logout user
const logoutUser = async (req, res) => {
  try {
    res
      .cookie("token", "", { sameSite: "none", secure: true })
      .status(201)
      .json({
        message: "user logged out successfully",
      });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    //verify the user token

    const userId = req.user.userId;

    //getting data from FE

    const {
      firstName,
      lastName,
      location,
      occupation,
      contactNo,
      picturePath,
    } = req.body;

    const matchedUser = await User.findById(userId);

    matchedUser.firstName = firstName;
    matchedUser.lastName = lastName;
    matchedUser.location = location;
    matchedUser.occupation = occupation;
    matchedUser.contactNo = contactNo;
    matchedUser.picturePath = picturePath;

    await matchedUser.save();

    const user = await User.findById(userId).select("-password");

    //sending data to FE

    res.status(200).json({ user, message: "updated Successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    //getting data from FE

    const userId = req.user.userId;

    const { oldpassword, password } = req.body;

    const matchedUser = await User.findById(userId);

    if (!matchedUser) {
      return res.status(401).json({ message: "user not exist" });
    }

    // check if old password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(
      oldpassword,
      matchedUser.password
    );

    // Save new password
    if (matchedUser && passwordIsCorrect) {
      matchedUser.password = password;

      await matchedUser.save();

      //getting data from FE

      res.status(200).send({ message: "Password updated successfully" });
    } else {
      res.status(400);
      return res.status(401).json({ message: "old password wrong" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    //getting data from FE

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User not exists" });
      return;
    }

    // Delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id });

    if (token) {
      await token.deleteOne();
    }

    // Create Reste Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    // Hash token before saving to DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save Token to DB
    await new Token({
      userId: user._id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
    }).save();

    // Construct Reset Url
    const resetUrl = `${FEURL}/reset/${resetToken}`;

    // Reset Email
    const message = `
      <h2>Hello ${user.firstName}</h2>
      <p>Please use the url below to reset your password</p>  
      <p>This reset link is valid for only 30minutes.</p>

      <a href=${resetUrl} target="_blank">${resetUrl}</a>

      <p>Regards...</p>
      <p>Social Share App Team</p>
    `;
    const subject = "Password Reset Request";

    //sending email for Confirm account

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_ADDRESS,
        pass: APP_PASSWORD,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
        from: `"Renugadevi" <${APP_PASSWORD}>`,
        to: user.email,
        subject,
        html: message,
      });
    };

    //sending mail with reset link

    sendMail();

    return res
      .status(201)
      .json({ message: `Mail has been send to ${user.email}` });
    //
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    //getting data & id from FE

    const { password } = req.body;

    const { resetToken } = req.params;

    // Hash token, then compare to Token in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // fIND tOKEN in DB
    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
      res.status(400).json({ message: "Link Expired, Please try again" });
      return;
    }

    // Find user
    const user = await User.findOne({ _id: userToken.userId });

    user.password = password;

    await user.save();

    await userToken.deleteOne();

    //sending response data to FE

    res.status(200).json({
      message: "Password updated Successfully, Please Login",
    });
    //
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  confirmUser,
  loginUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutUser,
};