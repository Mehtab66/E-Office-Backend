const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} = require("../controllers/client.controller");

const router = express.Router();

router
  .route("/")
  .post(authMiddleware(["manager"]), createClient)
  .get(authMiddleware(["manager"]), getClients);

router
  .route("/:id")
  .get(authMiddleware(["manager"]), getClient)
  .put(authMiddleware(["manager"]), updateClient)
  .delete(authMiddleware(["manager"]), deleteClient);

module.exports = router;
