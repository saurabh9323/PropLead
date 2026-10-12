const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/dashboard", authorizeRoles("admin", "CRM"), getDashboard);

module.exports = router;
