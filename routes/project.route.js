// const express = require("express");
// const authMiddleware = require("../middlewares/auth.middleware");
// const {
//   addProject,
//   getProjects,
//   getProject,
//   updateProject,
//   deleteProject,
//   getAllTimeEntries,
//   getAllTasks,
// } = require("../controllers/project.controller");

// const router = express.Router();

// router
//   .route("/")
//   .post(authMiddleware(["manager"]), addProject)
//   .get(authMiddleware(["manager", "employee"]), getProjects);

// router
//   .route("/:id")
//   .get(authMiddleware(["manager", "employee"]), getProject)
//   .put(authMiddleware(["manager"]), updateProject)
//   .delete(authMiddleware(["manager"]), deleteProject);
// router.get(
//   "/global/time-entries",
//   authMiddleware(["manager", "employee"]),
//   getAllTimeEntries
// );
// router.get(
//   "/global/tasks",
//   authMiddleware(["manager", "employee"]),
//   getAllTasks
// );

// module.exports = router;
// const mongoose = require('mongoose');
// const express = require("express");
// const authMiddleware = require("../middlewares/auth.middleware");
// const {
//   addProject,
//   getProjects,
//   getProject,
//   updateProject,
//   deleteProject,
//   getAllTimeEntries,
//   getAllTasks,
// } = require("../controllers/project.controller");

// // 1. IMPORT YOUR TASK ROUTER
// const taskRouter = require("./task.route");

// const router = express.Router();

// // --- /api/projects/ ---
// router
//   .route("/")
//   .post(authMiddleware(["manager"]), addProject)
//   .get(authMiddleware(["manager", "employee"]), getProjects);

// // --- /api/projects/global/... ---
// router.get(
//   "/global/time-entries",
//   authMiddleware(["manager", "employee"]),
//   getAllTimeEntries
// );
// router.get(
//   "/global/tasks",
//   authMiddleware(["manager", "employee"]),
//   getAllTasks
// );

// // 2. "USE" THE TASK ROUTER FOR NESTED ROUTES
// //    FIX: Changed from :id to :projectId
// router.use("/:projectId/tasks", taskRouter);

// // --- /api/projects/:projectId ---
// //    FIX: Changed from :id to :projectId
// router
//   .route("/:projectId")
//   .get(authMiddleware(["manager", "employee"]), getProject)
//   .put(authMiddleware(["manager"]), updateProject)
//   .delete(authMiddleware(["manager"]), deleteProject);

// module.exports = router;
const mongoose = require('mongoose');
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  addProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getAllTimeEntries,
  getAllTasks,
} = require("../controllers/project.controller");

// 1. IMPORT YOUR TASK ROUTER
const taskRouter = require("./task.route");

// 2. IMPORT YOUR DELIVERABLE ROUTER (THIS WAS MISSING)
const deliverableRouter = require("./deliverable.route"); // <-- ADD THIS
const router = express.Router();
// --- /api/projects/ ---
router
  .route("/")
  .post(authMiddleware(["manager"]), addProject)
  .get(authMiddleware(["manager", "employee"]), getProjects);

// --- /api/projects/global/... ---
router.get(
  "/global/time-entries",
  authMiddleware(["manager", "employee"]),
  getAllTimeEntries
);
router.get(
  "/global/tasks",
  authMiddleware(["manager", "employee"]),
  getAllTasks
);

// 3. "USE" THE TASK ROUTER FOR NESTED ROUTES
//    FIX: Changed from :id to :projectId
router.use("/:projectId/tasks", taskRouter);

// 4. "USE" THE DELIVERABLE ROUTER (THIS WAS MISSING)
router.use("/:projectId/deliverables", deliverableRouter); // <-- ADD THIS

// --- /api/projects/:projectId ---
//    FIX: Changed from :id to :projectId
router
  .route("/:projectId")
  .get(authMiddleware(["manager", "employee"]), getProject)
  .put(authMiddleware(["manager"]), updateProject)
  .delete(authMiddleware(["manager"]), deleteProject);

module.exports = router;