// const express = require("express");
// const authMiddleware = require("../middlewares/auth.middleware");
// const{
//   getTimeEntries,
//   getTimeEntry,
//   createTimeEntry,
//   updateTimeEntry,
//   deleteTimeEntry,
//   getAllTimeEntries
//   // Remove getAllTimeEntries, it's handled by the project router
// } = require("../controllers/timeEntryController");

// // 1. ADD { mergeParams: true }
// const router = express.Router({ mergeParams: true });

// // Existing project-specific routes
// // These are now correct and will get :projectId from the parent
// router.get("/", authMiddleware(["manager", "employee"]), getTimeEntries);
// router.get(
//   "/:timeEntryId",
//   authMiddleware(["manager", "employee"]),
//   getTimeEntry
// );
// router.post("/", authMiddleware(["manager", "employee"]), createTimeEntry); // This is the route that was 404ing
// router.put(
//   "/:timeEntryId",
//   authMiddleware(["manager", "employee"]),
//   updateTimeEntry
// );
// router.delete(
//   "/:timeEntryId",
//   authMiddleware(["manager", "employee"]),
//   deleteTimeEntry
// );

// // 2. REMOVE THE DUPLICATE GLOBAL ROUTE

// // router.get(
// //   "/global/time-entries",
// //   authMiddleware(["manager", "employee"]),
// //   getAllTimeEntries
// // );


// module.exports = router;

// routes/timeEntryRoutes.js
const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getAllTimeEntries,
} = require("../controllers/timeEntryController");

// mergeParams: true so it can receive :projectId when nested under /projects/:projectId
const router = express.Router({ mergeParams: true });

// GET list
// - When mounted under /projects/:projectId/time-entries => req.params.projectId exists => getTimeEntries
// - When mounted under /time-entries => no projectId => getAllTimeEntries (global)
router.get(
  "/",
  authMiddleware(["manager", "employee"]),
  (req, res, next) =>
    req.params.projectId ? getTimeEntries(req, res, next) : getAllTimeEntries(req, res, next)
);

// Create project-scoped (requires projectId)
router.post("/", authMiddleware(["manager", "employee"]), (req, res, next) => {
  if (!req.params.projectId) return res.status(400).json({ error: "Missing projectId" });
  return createTimeEntry(req, res, next);
});

// Single time entry endpoints (projectId optional for read/update/delete because timeEntry has project reference)
router.get("/:timeEntryId", authMiddleware(["manager", "employee"]), getTimeEntry);
router.put("/:timeEntryId", authMiddleware(["manager", "employee"]), updateTimeEntry);
router.delete("/:timeEntryId", authMiddleware(["manager", "employee"]), deleteTimeEntry);

module.exports = router;
