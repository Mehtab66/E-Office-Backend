const Task = require("../models/task.model");
const Project = require("../models/project.model");
const User = require("../models/employee.model");
const { validateTask } = require("../validators/task.validator");

const createTask = async (req, res, next) => {
  try {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (req.user.role !== "manager" && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { assignedTo } = req.body;
    const member = await User.findById(assignedTo);
    if (
      !member ||
      member.role !== "team_member" ||
      !project.teamMembers.includes(assignedTo)
    ) {
      return res.status(400).json({ error: "Invalid team member" });
    }

    const task = await Task.create({
      ...req.body,
      project: req.params.projectId,
      createdBy: req.user.id,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

const getTasks = async (req, res, next) => {
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
    const tasks = await Task.find({ project: req.params.projectId }).populate(
      "assignedTo createdBy"
    );
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId).populate(
      "assignedTo createdBy"
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    const project = await Project.findById(task.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { error } = validateTask(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const project = await Project.findById(task.project);
    if (req.user.role !== "manager" && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { assignedTo } = req.body;
    if (assignedTo) {
      const member = await User.findById(assignedTo);
      if (
        !member ||
        member.role !== "team_member" ||
        !project.teamMembers.includes(assignedTo)
      ) {
        return res.status(400).json({ error: "Invalid team member" });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("assignedTo createdBy");
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const project = await Project.findById(task.project);
    if (req.user.role !== "manager" && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
