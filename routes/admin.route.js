const express = require("express");
const {
  createUser,
  getUsers,
  updateUser,
  getDashboardStats,
  deleteUser,
} = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// Create a new user
router.post("/AddEmployee", authMiddleware(["admin"]), createUser);

// Get all users (with optional search and pagination)
router.get("/GetEmployees", authMiddleware(["admin"]), getUsers);

// Update a user
router.patch("/UpdateEmployee/:id", authMiddleware(["admin"]), updateUser);

// Delete a user
router.delete("/DeleteEmployee/:id", authMiddleware(["admin"]), deleteUser);
router.get("/GetDashboardStats", authMiddleware(["admin"]), getDashboardStats);
module.exports = router;
