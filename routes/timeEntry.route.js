const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getTimeEntries,
  getTimeEntry,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getAllTimeEntries, // Ensure this is imported from timeEntryController.js
} = require("../controllers/timeEntryController");

const router = express.Router();

// Existing project-specific routes
router.get("/", authMiddleware(["manager", "employee"]), getTimeEntries);
router.get(
  "/:timeEntryId",
  authMiddleware(["manager", "employee"]),
  getTimeEntry
);
router.post("/", authMiddleware(["manager", "employee"]), createTimeEntry);
router.put(
  "/:timeEntryId",
  authMiddleware(["manager", "employee"]),
  updateTimeEntry
);
router.delete(
  "/:timeEntryId",
  authMiddleware(["manager", "employee"]),
  deleteTimeEntry
);

// New route for fetching all time entries across projects
router.get(
  "/global/time-entries",
  authMiddleware(["manager", "employee"]),
  getAllTimeEntries
);

module.exports = router;
