const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getDashboardStats } = require("../controllers/employee.controller");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware(["manager", "employee"]),
  getDashboardStats
);

module.exports = router;
