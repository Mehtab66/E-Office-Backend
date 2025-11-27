const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// All routes require authentication
router.use(authMiddleware(["manager", "employee", "admin"]));

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

module.exports = router;
