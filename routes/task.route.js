
// const express = require("express");
// const authMiddleware = require("../middlewares/auth.middleware");
// const {
//   getTasks,
//   getTask,
//   createTask,
//   updateTask,
//   deleteTask,
//   createSubtask,
// } = require("../controllers/task.controller");

// // 1. CRITICAL FIX: Add { mergeParams: true }
// // This allows this router to access ":projectId" from its parent router.
// const router = express.Router({ mergeParams: true });

// // These routes are now relative to /api/projects/:projectId/tasks

// // POST /api/projects/:projectId/tasks
// router.post("/", authMiddleware(["manager", "employee"]), createTask);

// // GET /api/projects/:projectId/tasks
// router.get("/", authMiddleware(["manager", "employee"]), getTasks);

// // GET /api/projects/:projectId/tasks/:taskId
// router.get("/:taskId", authMiddleware(["manager", "employee"]), getTask);

// // PUT /api/projects/:projectId/tasks/:taskId
// router.put("/:taskId", authMiddleware(["manager"]), updateTask);

// // DELETE /api/projects/:projectId/tasks/:taskId
// router.delete("/:taskId", authMiddleware(["manager"]), deleteTask);

// // POST /api/projects/:projectId/tasks/:taskId/subtasks
// router.post("/:taskId/subtasks", authMiddleware(["manager"]), createSubtask);

// module.exports = router;
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
} = require("../controllers/task.controller");

// 1. CRITICAL FIX: Add { mergeParams: true }
// This allows this router to access ":projectId" from its parent router.
const router = express.Router({ mergeParams: true });

// These routes are now relative to /api/projects/:projectId/tasks

// POST /api/projects/:projectId/tasks
router.post("/", authMiddleware(["manager", "employee"]), createTask);

// GET /api/projects/:projectId/tasks
router.get("/", authMiddleware(["manager", "employee"]), getTasks);

// GET /api/projects/:projectId/tasks/:taskId
router.get("/:taskId", authMiddleware(["manager", "employee"]), getTask);

// PUT /api/projects/:projectId/tasks/:taskId
router.put("/:taskId", authMiddleware(["manager"]), updateTask);

// DELETE /api/projects/:projectId/tasks/:taskId
router.delete("/:taskId", authMiddleware(["manager"]), deleteTask);

// POST /api/projects/:projectId/tasks/:taskId/subtasks
// --- THIS IS THE FIX ---
// Changed from authMiddleware(["manager"]) to allow employees.
// The controller (createSubtask) will handle the specific logic 
// (manager or team lead)
router.post(
  "/:taskId/subtasks", 
  authMiddleware(["manager", "employee"]), 
  createSubtask
);

module.exports = router;