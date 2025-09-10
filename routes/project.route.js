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

const router = express.Router();

router
  .route("/")
  .post(authMiddleware(["manager"]), addProject)
  .get(authMiddleware(["manager", "employee"]), getProjects);

router
  .route("/:id")
  .get(authMiddleware(["manager", "employee"]), getProject)
  .put(authMiddleware(["manager"]), updateProject)
  .delete(authMiddleware(["manager"]), deleteProject);
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

module.exports = router;
