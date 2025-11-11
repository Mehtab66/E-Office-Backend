// const TimeEntry = require("../models/timeEntry.model");
// const Project = require("../models/project.model");
// const { validateTimeEntry } = require("../validators/timeEntry.validator");

// const createTimeEntry = async (req, res, next) => {
//   try {
//     const { error } = validateTimeEntry(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const project = await Project.findById(req.params.projectId);
//     if (!project) return res.status(404).json({ error: "Project not found" });
//     if (
//       req.user.role !== "manager" &&
//       !project.teamLead.equals(req.user.id) &&
//       !project.teamMembers.includes(req.user.id)
//     ) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const timeEntry = await TimeEntry.create({
//       ...req.body,
//       project: req.params.projectId,
//       user: req.user.id,
//     });
//     res.status(201).json(timeEntry);
//   } catch (err) {
//     next(err);
//   }
// };

// const getTimeEntries = async (req, res, next) => {
//   console.log("Fetching time entries for project:");
//   try {
//     const project = await Project.findById(req.params.projectId);
//     if (!project) return res.status(404).json({ error: "Project not found" });
//     if (
//       req.user.role !== "manager" &&
//       !project.teamLead.equals(req.user.id) &&
//       !project.teamMembers.includes(req.user.id)
//     ) {
//       return res.status(403).json({ error: "Access denied" });
//     }
//     const query =
//       req.user.role === "manager" || project.teamLead.equals(req.user.id)
//         ? { project: req.params.projectId }
//         : { project: req.params.projectId, user: req.user.id };
//     const timeEntries = await TimeEntry.find(query).populate("user task");
//     res.json(timeEntries);
//   } catch (err) {
//     next(err);
//   }
// };

// const getTimeEntry = async (req, res, next) => {
//   try {
//     const timeEntry = await TimeEntry.findById(req.params.timeEntryId).populate(
//       "user task"
//     );
//     if (!timeEntry)
//       return res.status(404).json({ error: "Time entry not found" });
//     const project = await Project.findById(timeEntry.project);
//     if (
//       req.user.role !== "manager" &&
//       !project.teamLead.equals(req.user.id) &&
//       !timeEntry.user.equals(req.user.id)
//     ) {
//       return res.status(403).json({ error: "Access denied" });
//     }
//     res.json(timeEntry);
//   } catch (err) {
//     next(err);
//   }
// };

// const updateTimeEntry = async (req, res, next) => {
//   try {
//     const { error } = validateTimeEntry(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const timeEntry = await TimeEntry.findById(req.params.timeEntryId);
//     if (!timeEntry)
//       return res.status(404).json({ error: "Time entry not found" });
//     const project = await Project.findById(timeEntry.project);
//     if (
//       req.user.role !== "manager" &&
//       !project.teamLead.equals(req.user.id) &&
//       !timeEntry.user.equals(req.user.id)
//     ) {
//       return res.status(403).json({ error: "Access denied" });
//     }
//     if (
//       req.body.approved &&
//       req.user.role !== "manager" &&
//       !project.teamLead.equals(req.user.id)
//     ) {
//       return res
//         .status(403)
//         .json({ error: "Only manager or team lead can approve" });
//     }

//     const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
//       req.params.timeEntryId,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     ).populate("user task");
//     res.json(updatedTimeEntry);
//   } catch (err) {
//     next(err);
//   }
// };

// const deleteTimeEntry = async (req, res, next) => {
//   try {
//     const timeEntry = await TimeEntry.findById(req.params.timeEntryId);
//     if (!timeEntry)
//       return res.status(404).json({ error: "Time entry not found" });
//     const project = await Project.findById(timeEntry.project);
//     if (req.user.role !== "manager" && !timeEntry.user.equals(req.user.id)) {
//       return res.status(403).json({ error: "Access denied" });
//     }
//     await TimeEntry.findByIdAndDelete(req.params.timeEntryId);
//     res.json({ message: "Time entry deleted" });
//   } catch (err) {
//     next(err);
//   }
// };

// // Paste this into timeEntryController.js, replacing your old function
// const getAllTimeEntries = async (req, res, next) => {
//   try {
//     const { projectId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
//     const userId = req.user.id;
//     const userRole = req.user.role; // <-- Gets the user's role

//     let query = {}; // <-- Starts with an empty query

//     // === THIS IS THE CORRECT LOGIC ===
//     if (userRole === "manager") {
//       // If manager, just filter by project (if it exists)
//       if (projectId) {
//         query.project = projectId;
//       }
//       // If no projectId, the query is {}, so manager sees ALL time entries
//     } else {
//       // If employee, ALWAYS filter by their ID
//       query.user = userId;
//       if (projectId) {
//         query.project = projectId; // And by project (if it exists)
//       }
//     }
//     // === END OF LOGIC ===

//     const timeEntries = await TimeEntry.find(query)
//       .populate("project", "name")
//       .populate("user", "name") // <-- So you can see *who* submitted it
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ date: -1 })
//       .lean();

//     const total = await TimeEntry.countDocuments(query);

//     res.status(200).json({
//       timeEntries,
//       pagination: { page: Number(page), limit: Number(limit), total },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   createTimeEntry,
//   getTimeEntries,
//   getTimeEntry,
//   updateTimeEntry,
//   deleteTimeEntry,
//   getAllTimeEntries,
// };
// controllers/timeEntryController.js
const TimeEntry = require("../models/timeEntry.model");
const Project = require("../models/project.model");
const { validateTimeEntry } = require("../validators/timeEntry.validator");

// Create (project-scoped)
const createTimeEntry = async (req, res, next) => {
  try {
    const { error } = validateTimeEntry(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const projectId = req.params.projectId;
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // authorization: manager OR teamLead OR teamMember
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const timeEntry = await TimeEntry.create({
      ...req.body,
      project: projectId,
      user: req.user.id,
    });

    res.status(201).json(timeEntry);
  } catch (err) {
    next(err);
  }
};

// GET project-scoped list
const getTimeEntries = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const query =
      req.user.role === "manager" || project.teamLead.equals(req.user.id)
        ? { project: projectId }
        : { project: projectId, user: req.user.id };

    const timeEntries = await TimeEntry.find(query).populate("user", "name").lean();
    res.json(timeEntries);
  } catch (err) {
    next(err);
  }
};

// GET single time entry
const getTimeEntry = async (req, res, next) => {
  try {
    const { timeEntryId } = req.params;
    const timeEntry = await TimeEntry.findById(timeEntryId).populate("user", "name");
    if (!timeEntry) return res.status(404).json({ error: "Time entry not found" });

    const project = await Project.findById(timeEntry.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !timeEntry.user.equals(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(timeEntry);
  } catch (err) {
    next(err);
  }
};

// Update
const updateTimeEntry = async (req, res, next) => {
  try {
    const { error } = validateTimeEntry(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { timeEntryId } = req.params;
    const timeEntry = await TimeEntry.findById(timeEntryId);
    if (!timeEntry) return res.status(404).json({ error: "Time entry not found" });

    const project = await Project.findById(timeEntry.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !timeEntry.user.equals(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Only manager or team lead can approve
    if (
      req.body.approved &&
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id)
    ) {
      return res.status(403).json({ error: "Only manager or team lead can approve" });
    }

    const updated = await TimeEntry.findByIdAndUpdate(timeEntryId, req.body, {
      new: true,
      runValidators: true,
    }).populate("user", "name");

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete
const deleteTimeEntry = async (req, res, next) => {
  try {
    const { timeEntryId } = req.params;
    const timeEntry = await TimeEntry.findById(timeEntryId);
    if (!timeEntry) return res.status(404).json({ error: "Time entry not found" });

    if (req.user.role !== "manager" && !timeEntry.user.equals(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await TimeEntry.findByIdAndDelete(timeEntryId);
    res.json({ message: "Time entry deleted" });
  } catch (err) {
    next(err);
  }
};

// Global GET with filters (unscoped)
// replace your getAllTimeEntries with this
const getAllTimeEntries = async (req, res, next) => {
  try {
    const { projectId, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = {};
    if (userRole === "manager") {
      if (projectId) query.project = projectId;
    } else {
      query.user = userId;
      if (projectId) query.project = projectId;
    }

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const [timeEntries, total] = await Promise.all([
      TimeEntry.find(query)
        // populate multiple possible name fields so frontend can pick one
        .populate("user", "name")
        .populate("project", "name")
        .sort({ date: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean()
        .exec(),
      TimeEntry.countDocuments(query),
    ]);

    res.json({
      timeEntries,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getAllTimeEntries,
};
