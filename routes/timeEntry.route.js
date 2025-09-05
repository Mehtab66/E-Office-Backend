const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} = require("../controllers/timeEntryController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(authMiddleware(["manager", "team_lead"]), createTimeEntry)
  .get(authMiddleware(["manager", "team_lead"]), getTimeEntries);

router
  .route("/:timeEntryId")
  .get(authMiddleware(["manager", "team_lead"]), getTimeEntry)
  .put(authMiddleware(["manager", "team_lead"]), updateTimeEntry)
  .delete(authMiddleware(["manager", "team_lead"]), deleteTimeEntry);

module.exports = router;
