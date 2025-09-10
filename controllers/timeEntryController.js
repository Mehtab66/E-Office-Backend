const TimeEntry = require("../models/timeEntry.model");
const Project = require("../models/project.model");
const { validateTimeEntry } = require("../validators/timeEntry.validator");

const createTimeEntry = async (req, res, next) => {
  try {
    const { error } = validateTimeEntry(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const timeEntry = await TimeEntry.create({
      ...req.body,
      project: req.params.projectId,
      user: req.user.id,
    });
    res.status(201).json(timeEntry);
  } catch (err) {
    next(err);
  }
};

const getTimeEntries = async (req, res, next) => {
  console.log("Fetching time entries for project:");
  try {
    const project = await Project.findById(req.params.projectId);
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
        ? { project: req.params.projectId }
        : { project: req.params.projectId, user: req.user.id };
    const timeEntries = await TimeEntry.find(query).populate("user task");
    res.json(timeEntries);
  } catch (err) {
    next(err);
  }
};

const getTimeEntry = async (req, res, next) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.timeEntryId).populate(
      "user task"
    );
    if (!timeEntry)
      return res.status(404).json({ error: "Time entry not found" });
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

const updateTimeEntry = async (req, res, next) => {
  try {
    const { error } = validateTimeEntry(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const timeEntry = await TimeEntry.findById(req.params.timeEntryId);
    if (!timeEntry)
      return res.status(404).json({ error: "Time entry not found" });
    const project = await Project.findById(timeEntry.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !timeEntry.user.equals(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (
      req.body.approved &&
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id)
    ) {
      return res
        .status(403)
        .json({ error: "Only manager or team lead can approve" });
    }

    const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
      req.params.timeEntryId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("user task");
    res.json(updatedTimeEntry);
  } catch (err) {
    next(err);
  }
};

const deleteTimeEntry = async (req, res, next) => {
  try {
    const timeEntry = await TimeEntry.findById(req.params.timeEntryId);
    if (!timeEntry)
      return res.status(404).json({ error: "Time entry not found" });
    const project = await Project.findById(timeEntry.project);
    if (req.user.role !== "manager" && !timeEntry.user.equals(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    await TimeEntry.findByIdAndDelete(req.params.timeEntryId);
    res.json({ message: "Time entry deleted" });
  } catch (err) {
    next(err);
  }
};

const getAllTimeEntries = async (req, res) => {
  const userId = req.user.id;
  const { projectId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

  const query = { user: userId };
  if (projectId) query.project = projectId;
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  const timeEntries = await TimeEntry.find(query)
    .populate("project", "name")
    .populate("user", "name")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await TimeEntry.countDocuments(query);

  res.status(200).json({
    timeEntries,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
};
module.exports = {
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getAllTimeEntries,
};
