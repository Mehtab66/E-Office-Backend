const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { validateAnalytics } = require("../validators/analytics.validator");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/", authMiddleware(["manager", "admin"]), validateAnalytics, analyticsController.getProjectAnalytics);
router.get("/users", authMiddleware(["manager", "admin"]), analyticsController.getUsers);

module.exports = router;
