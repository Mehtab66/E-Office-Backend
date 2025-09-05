const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  addProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

router
  .route("/")
  .post(authMiddleware(["manager"]), addProject)
  .get(authMiddleware(["manager"]), getProjects);

router
  .route("/:id")
  .get(authMiddleware(["manager"]), getProject)
  .put(authMiddleware(["manager"]), updateProject)
  .delete(authMiddleware(["manager"]), deleteProject);

module.exports = router;
