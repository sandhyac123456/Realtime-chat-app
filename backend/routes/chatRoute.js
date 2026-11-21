const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createChat, getMyChats } = require("../controllers/chatController");
router.post("/create", authMiddleware, createChat);
router.get("/my-chats", authMiddleware, getMyChats);

module.exports = router;