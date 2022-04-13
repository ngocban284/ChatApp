const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const allUsers = asyncHandler(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, pic } = req.body;
  // console.log(name, email, password);
  if (!name || !email || !password) {
    return next(new Error("Please provide name, email and password"));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, pic });

  if (user) {
    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      token,
      name: user.name,
      email: user.email,
      pic: user.pic,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("User already exists");
  }
});

const authUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Error("Please provide email and password"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("Invalid email or password"));
  }

  if (user && user.matchPassword(password)) {
    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      token,
      name: user.name,
      email: user.email,
      pic: user.pic,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

module.exports = {
  allUsers,
  registerUser,
  authUser,
};
