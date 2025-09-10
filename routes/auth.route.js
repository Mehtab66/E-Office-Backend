const express = require("express");
const {
  login,
  updatePassword,
  getCurrentUser,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.patch(
  "/update-password",
  authMiddleware(["admin", "manager", "employee"]),
  updatePassword
);
router.get("/me", authMiddleware(["manager", "employee"]), getCurrentUser);

module.exports = router;
