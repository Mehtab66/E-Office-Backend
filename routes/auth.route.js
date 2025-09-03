const express = require("express");
const { login, updatePassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.patch(
  "/update-password",
  authMiddleware(["admin", "manager", "employee"]),
  updatePassword
);

module.exports = router;
