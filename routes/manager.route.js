const express = require("express");

const {
  getManagerDashboardStats,
} = require("../controllers/manager.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.get(
  "/GetManagerDashboardStats",
  authMiddleware(["manager"]),
  getManagerDashboardStats
);
module.exports = router;
