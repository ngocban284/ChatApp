const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chatControllers");

router.route("/").get(protect, fetchChats);
router.route("/").post(protect, accessChat);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").delete(protect, removeFromGroup);
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;
