const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getUserProfile,getAllUsers } = require("../controllers/userController");

router.get("/all-users", authMiddleware, getAllUsers);
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;