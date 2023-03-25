// ---------------------------------------------------------------
//                      AUTH CONTROLLER
// ---------------------------------------------------------------
const { ctrlWrapper, HttpError } = require("../utils");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");
const sendMail = require("../utils/sendEmailUkrnet");
const sendGridEmail = require("../utils/sendGridEmail");
require("dotenv").config();

const { BASE_URL } = process.env;

// --------------- signup ------------------------------------------
const signup = async (req, res) => {
  const { email, password } = req.body;
  const avatarURL = gravatar.url(email);
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);

  //  send email

  const verificationToken = nanoid();
  const msg = {
    to: email,
    subject: "Varification email",
    html: `<h1>Email varification</h1> Varification email <a href="${BASE_URL}/user/verify/${verificationToken}">Click link</a>`,
  };

  // const sendEmailError = await sendMail(msg); // sending email through ukr.net
  const sendEmailError = await sendGridEmail(msg); // sending email through sendgrid

  if (sendEmailError) {
    throw HttpError(500, sendEmailError);
  }
  // --------------------------------

  const result = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  res.status(201).json({
    email: result.email,
    password: result.password,
  });
};

// ------------------ login ----------------------------------------
const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(409, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(409, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(409, "Email not verified");
  }

  // create jwt
  const payload = {
    id: user._id,
  };
  const { SECRET_KEY } = process.env;
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
  // -------------------------------

  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

// --------------------------- logout ------------------------------
const logout = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, { token: null });
  if (!user) {
    throw HttpError(401, "Not authorized");
  }
  res.status(204).json({
    message: "No Content",
  });
};

// -------------------------- current ------------------------------
const current = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(201).json({
    email,
    subscription,
  });
};

// -------------------------- updateAvatar -------------------------
const updateAvatar = async (req, res) => {
  const avatarDir = path.join(__dirname, "../", "public", "avatars");
  const { _id } = req.user;

  const { path: tempUpload, originalname } = req.file;
  const resultUpload = path.join(avatarDir, `${_id}_${originalname}`);

  fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", `${_id}_${originalname}`);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

// -------------------------- verify -------------------------
const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.status(200).json({
    message: "Verification successful",
  });
};

// -------------------------- resendVerifyEmail -------------------
const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  //  send email

  const msg = {
    to: user.email,
    subject: "Varification email",
    html: `<h1>Email varification</h1> Varification email <a href="${BASE_URL}/user/verify/${user.verificationToken}">Click link</a>`,
  };

  // const sendEmailError = await sendMail(msg);    // sending email through ukr.net
  const sendEmailError = await sendGridEmail(msg); // sending email through sendgrid
  // --------------------------------
  if (sendEmailError) {
    throw HttpError(500, sendEmailError);
  }
  res.status(200).json({
    message: "Verification email sent",
  });
};

module.exports = {
  signup: ctrlWrapper(signup),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateAvatar: ctrlWrapper(updateAvatar),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
