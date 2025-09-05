const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(authMiddleware(["manager", "team_lead"]), createTask)
  .get(authMiddleware(["manager", "team_lead"]), getTasks);

router
  .route("/:taskId")
  .get(authMiddleware(["manager", "team_lead"]), getTask)
  .put(authMiddleware(["manager", "team_lead"]), updateTask)
  .delete(authMiddleware(["manager", "team_lead"]), deleteTask);

module.exports = router;
