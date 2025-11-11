// routes/users.route.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
// const employeeController = require("../controllers/employee.controller");

// public endpoints (add auth middleware in front if you have authentication)
router.post("/", usersController.createUser); // create user
router.get("/manager", usersController.getFirstManager); // GET first manager (for frontend)
router.get("/managers", usersController.getManagers); // all managers

// employee specific routes (specific paths first - avoid conflict with :id)
// router.get("/employees/all", employeeController.getEmployees);
// router.get("/employees/:id", employeeController.getEmployeeById);

// generic user routes (parameterized routes last)
router.get("/:id", usersController.getUserById); // get user by id
router.put("/:id", usersController.updateUser); // update
router.delete("/:id", usersController.deleteUser); // delete

module.exports = router;
