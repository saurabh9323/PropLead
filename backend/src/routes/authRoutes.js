const express = require("express");
const { login, logout, getProfile } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/logout", authenticateToken, logout);
router.get("/auth/me", authenticateToken, getProfile);

module.exports = router;
