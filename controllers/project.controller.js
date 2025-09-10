const Project = require("../models/project.model");
const Client = require("../models/client.model");
const User = require("../models/employee.model");
const TimeEntry = require("../models/timeEntry.model");
const Task = require("../models/task.model");
const { validateProject } = require("../validators/project.validator");

const addProject = async (req, res, next) => {
  try {
    const { error } = validateProject(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { client, teamLead, teamMembers } = req.body;

    // Validate client existence
    const existingClient = await Client.findById(client);
    if (!existingClient)
      return res.status(400).json({ error: "Client does not exist" });

    // Validate teamLead existence
    const lead = await User.findById(teamLead);
    if (!lead) return res.status(400).json({ error: "Invalid team lead" });

    // Validate teamMembers existence (if provided)
    if (teamMembers && teamMembers.length > 0) {
      const members = await User.find({ _id: { $in: teamMembers } });
      if (members.length !== teamMembers.length)
        return res
          .status(400)
          .json({ error: "One or more team members are invalid" });
    }

    // Create project
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.id,
    });

    // Update client with project reference
    await Client.findByIdAndUpdate(client, {
      $push: { projects: project._id },
    });

    // Update users (teamLead and teamMembers) with project reference
    const userIds = [teamLead, ...(teamMembers || [])];
    await User.updateMany(
      { _id: { $in: userIds } },
      { $push: { projects: project._id } }
    );

    res.status(201).json({ message: "Project added successfully", project });
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Debug log to see the actual role value
    console.log("User role from request:", req.user.role);
    console.log("User role type:", typeof req.user.role);

    // Case-insensitive role check
    const query =
      req.user.role?.toLowerCase() === "manager"
        ? {}
        : { $or: [{ teamLead: req.user.id }, { teamMembers: req.user.id }] };

    console.log("Final query being used:", JSON.stringify(query));

    // Get total count
    const total = await Project.countDocuments(query);
    console.log("total projects", total);

    // Get paginated projects
    const projects = await Project.find(query)
      .populate("client teamLead teamMembers")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    console.log("fetched projects count:", projects.length);

    // Return with pagination metadata
    res.json({
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "client teamLead teamMembers"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { error } = validateProject(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { teamLead, teamMembers } = req.body;
    if (teamLead) {
      const lead = await User.findById(teamLead);
      if (!lead || lead.role !== "team_lead")
        return res.status(400).json({ error: "Invalid team lead" });
    }
    if (teamMembers) {
      const members = await User.find({
        _id: { $in: teamMembers },
        role: "team_member",
      });
      if (members.length !== teamMembers.length)
        return res.status(400).json({ error: "Invalid team members" });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("client teamLead teamMembers");
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    await Client.findByIdAndUpdate(project.client, {
      $pull: { projects: project._id },
    });
    await User.updateMany(
      { projects: project._id },
      { $pull: { projects: project._id } }
    );
    res.json({ message: "Project deleted" });
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

const getAllTasks = async (req, res) => {
  const userId = req.user.id;
  const { projectId, priority, status, page = 1, limit = 20 } = req.query;

  const query = {
    $or: [{ assignedTo: userId }, { "subtasks.assignees": userId }],
  };
  if (projectId) query.project = projectId;
  if (priority) query.priority = priority;
  if (status) query.status = status;

  const tasks = await Task.find(query)
    .populate("project", "name")
    .populate("assignedTo", "name")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Task.countDocuments(query);

  res.status(200).json({
    tasks,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
};
module.exports = {
  getAllTimeEntries,
  addProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getAllTasks,
};
