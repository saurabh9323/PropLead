const express = require("express");
const { authorizeRoles } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  getUserById,
  getAllRoles,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/roles", authorizeRoles("admin"), getAllRoles);
router.get("/users", authorizeRoles("admin"), getAllUsers);
router.post("/users", authorizeRoles("admin"), createUser);
router.get("/users/:id", authorizeRoles("admin"), getUserById);
router.put("/users/:id", authorizeRoles("admin"), updateUser);
router.delete("/users/:id", authorizeRoles("admin"), deleteUser);

module.exports = router;
