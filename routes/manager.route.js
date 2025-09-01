const express = require("express");
const { addClient } = require("../controllers/client.controller");
const { addProject } = require("../controllers/project.controller");

const router = express.Router();

// Route for adding a new client
router.post("/AddClient", addClient);

// Route for adding a new project
router.post("/AddProject", addProject);

module.exports = router;
