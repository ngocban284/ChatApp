const express = require("express");
const router = express.Router();
const {
  allMessage,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

router.route("/:chatId").get(protect, allMessage);
router.route("/").post(protect, sendMessage);

module.exports = router;
