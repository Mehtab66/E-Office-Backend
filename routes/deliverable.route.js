const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createDeliverable,
  getDeliverables,
  getDeliverable,
  updateDeliverable,
  deleteDeliverable,
} = require("../controllers/deliverable.controller");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(authMiddleware(["manager", "team_lead"]), createDeliverable)
  .get(authMiddleware(["manager", "team_lead"]), getDeliverables);

router
  .route("/:deliverableId")
  .get(authMiddleware(["manager", "team_lead"]), getDeliverable)
  .put(authMiddleware(["manager", "team_lead"]), updateDeliverable)
  .delete(authMiddleware(["manager", "team_lead"]), deleteDeliverable);

module.exports = router; // ✅ correct
