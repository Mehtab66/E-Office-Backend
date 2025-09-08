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
  .post(authMiddleware(["manager", "employee"]), createDeliverable)
  .get(authMiddleware(["manager", "employee"]), getDeliverables);

router
  .route("/:deliverableId")
  .get(authMiddleware(["manager", "employee"]), getDeliverable)
  .put(authMiddleware(["manager", "employee"]), updateDeliverable)
  .delete(authMiddleware(["manager", "employee"]), deleteDeliverable);

module.exports = router; // ✅ correct
