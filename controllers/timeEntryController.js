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

module.exports = {
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
};
