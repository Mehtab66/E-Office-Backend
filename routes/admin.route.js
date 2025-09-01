const express = require("express");
const {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/admin.controller");

const router = express.Router();

// Create a new user
router.post("/AddEmployee", createUser);

// Get all users (with optional search and pagination)
router.get("/GetEmployees", getUsers);

// Update a user
router.patch("/UpdateEmployee/:id", updateUser);

// Delete a user
router.delete("/DeleteEmployee/:id", deleteUser);

module.exports = router;
