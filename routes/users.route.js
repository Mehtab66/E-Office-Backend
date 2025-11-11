// routes/users.route.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const authMiddleware = require("../middlewares/auth.middleware");
// const employeeController = require("../controllers/employee.controller");

// public endpoints (add auth middleware in front if you have authentication)
router.post("/", usersController.createUser); // create user
router.get("/manager", usersController.getFirstManager); // GET first manager (for frontend)
router.get("/managers", usersController.getManagers); // all managers

// employee specific routes (specific paths first - avoid conflict with :id)
// router.get("/employees/all", employeeController.getEmployees);
// router.get("/employees/:id", employeeController.getEmployeeById);

// generic user routes (parameterized routes last)
router.get("/:id", authMiddleware(["manager", "employee"]), usersController.getUserById); // get user by id
router.put("/:id", authMiddleware(["manager", "employee"]), usersController.updateUser); // update
router.delete("/:id", authMiddleware(["manager"]), usersController.deleteUser); // delete

module.exports = router;
