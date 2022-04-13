const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

//chat for message 1-1
const accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param is not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "lastMessage.sender",
          select: "name pic email",
        });
        res.status(200).json(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res, next) => {
  // console.log(req.body.name);
  if (!req.body.name || !req.body.users) {
    return res.status(400).send("Please Fill all the fields");
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("Please select atleast 2 users");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById({ _id: groupChat._id })
      .populate("users", "-password") // populate users with password
      .populate("groupAdmin", "-password"); // populate groupAdmin with password

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).send("Please Fill all the fields");
  }

  try {
    const updateChat = await Chat.findByIdAndUpdate(
      { _id: req.body.id },
      { chatName: req.body.name },
      { new: true }
    )
      .populate("users", "-password") // populate users with password
      .populate("groupAdmin", "-password"); // populate groupAdmin with password

    if (!updateChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.status(200).json(updateChat);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const removeFromGroup = asyncHandler(async (req, res, next) => {
  try {
    const removed = await Chat.findByIdAndUpdate(
      { _id: req.body.id },
      { $pull: { users: req.body.userId } },
      { new: true }
    )
      .populate("users", "-password") // populate users with password
      .populate("groupAdmin", "-password"); // populate groupAdmin with password

    if (!removed) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.status(200).json(removed);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const addToGroup = asyncHandler(async (req, res, next) => {
  try {
    const added = await Chat.findByIdAndUpdate(
      { _id: req.body.id },
      { $push: { users: req.body.userId } },
      { new: true }
    )
      .populate("users", "-password") // populate users with password
      .populate("groupAdmin", "-password"); // populate groupAdmin with password

    if (!added) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.status(200).json(added);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
