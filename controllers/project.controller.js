const Project = require("../models/project.model");
const Client = require("../models/client.model");
const User = require("../models/employee.model");
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
    const query =
      req.user.role === "manager"
        ? {}
        : { $or: [{ teamLead: req.user.id }, { teamMembers: req.user.id }] };
    const projects = await Project.find(query)
      .populate("client teamLead teamMembers")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    res.json(projects);
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

module.exports = {
  addProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
