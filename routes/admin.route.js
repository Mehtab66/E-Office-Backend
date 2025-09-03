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
router.post("/AddEmployee", authMiddleware(["Admin"]), createUser);

// Get all users (with optional search and pagination)
router.get("/GetEmployees", authMiddleware(["Admin"]), getUsers);

// Update a user
router.patch("/UpdateEmployee/:id", authMiddleware(["Admin"]), updateUser);

// Delete a user
router.delete("/DeleteEmployee/:id", authMiddleware(["Admin"]), deleteUser);
router.get("/GetDashboardStats", authMiddleware(["Admin"]), getDashboardStats);
module.exports = router;
