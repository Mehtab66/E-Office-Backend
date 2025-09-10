const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  getAllTasks, // Ensure this is imported from taskController.js
} = require("../controllers/task.controller");

const router = express.Router();

// Existing project-specific routes
router.get("/", authMiddleware(["manager", "employee"]), getTasks);
router.get("/:taskId", authMiddleware(["manager", "employee"]), getTask);
router.post("/", authMiddleware(["manager"]), createTask);
router.put("/:taskId", authMiddleware(["manager"]), updateTask);
router.delete("/:taskId", authMiddleware(["manager"]), deleteTask);
router.post("/:taskId/subtasks", authMiddleware(["manager"]), createSubtask);

// New route for fetching all tasks across projects
router.get(
  "/global/tasks",
  authMiddleware(["manager", "employee"]),
  getAllTasks
);

module.exports = router;
