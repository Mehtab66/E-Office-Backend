const Project = require("../models/project.model");
const Client = require("../models/client.model");
const User = require("../models/employee.model");
const TimeEntry = require("../models/timeEntry.model");
const Task = require("../models/task.model");
const { validateProject } = require("../validators/project.validator");
const Notification = require("../models/notification.model");
const socket = require("../socket");
const mongoose = require('mongoose');

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

    // --- NOTIFICATION LOGIC ---
    const io = socket.getIo();

    // 1. Notify Team Members
    if (teamMembers && teamMembers.length > 0) {
      for (const memberId of teamMembers) {
        const message = `You are taken as a team member in this project: ${project.name}`;

        // Create persistent notification
        const notification = await Notification.create({
          recipient: memberId,
          message: message,
          type: "info",
          relatedId: project._id,
        });

        // Emit socket event
        const userSocketId = socket.getUserSocketId(memberId);
        if (userSocketId) {
          io.to(userSocketId).emit("new_task", { // Reusing 'new_task' listener on frontend for simplicity
            message: message,
            notification: notification,
          });
        }
      }
    }

    // 2. Notify Team Lead
    if (teamLead) {
      const message = `You will lead this Project: ${project.name}`;

      // Create persistent notification
      const notification = await Notification.create({
        recipient: teamLead,
        message: message,
        type: "info",
        relatedId: project._id,
      });

      // Emit socket event
      const userSocketId = socket.getUserSocketId(teamLead);
      if (userSocketId) {
        io.to(userSocketId).emit("new_task", { // Reusing 'new_task' listener on frontend
          message: message,
          notification: notification,
        });
      }
    }
    // --------------------------

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

// const updateProject = async (req, res, next) => {
//   try {
//     const { error } = validateProject(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const { teamLead, teamMembers } = req.body;
//     if (teamLead) {
//       const lead = await User.findById(teamLead);
//       if (!lead || !["team_lead", "manager"].includes(lead.role))
//         return res.status(400).json({ error: "Invalid team lead" });
//     }
//     if (teamMembers) {
//       const members = await User.find({
//         _id: { $in: teamMembers },
//         role: "team_member",
//       });
//       if (members.length !== teamMembers.length)
//         return res.status(400).json({ error: "Invalid team members" });
//     }

//     const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     }).populate("client teamLead teamMembers");
//     if (!project) return res.status(404).json({ error: "Project not found" });
//     res.json(project);
//   } catch (err) {
//     next(err);
//   }
// };
const updateProject = async (req, res, next) => {
  try {
    const { error } = validateProject(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { teamLead, teamMembers } = req.body;
    if (teamLead && !mongoose.isValidObjectId(teamLead)) {
      return res.status(400).json({ error: "Invalid team lead ID format" });
    }
    if (teamMembers) {
      for (const memberId of teamMembers) {
        if (!mongoose.isValidObjectId(memberId)) {
          return res.status(400).json({ error: "Invalid team member ID format" });
        }
      }
    }

    // --- THIS IS THE FIX ---
    const project = await Project.findByIdAndUpdate(
      req.params.projectId, // Changed from req.params.id
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("client teamLead teamMembers");
    // --- END OF FIX ---

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
const getAllTimeEntries = async (req, res, next) => {
  try { // Added try...catch
    const userId = req.user.id; // Assuming user ID is needed based on your logic
    const { projectId, page = 1, limit = 20 } = req.query;

    // Base query (adjust based on your schema, e.g., filter by user)
    const query = { /* user: userId */ }; // Example: Filter by user

    if (projectId) {
      // VALIDATE projectId
      if (!mongoose.isValidObjectId(projectId)) {
        console.warn("getAllTimeEntries: Invalid projectId format received:", projectId);
        return res.status(400).json({ error: "Invalid projectId format sent" });
      }
      // Add to query ONLY if valid
      query.project = projectId;
    }

    const timeEntries = await TimeEntry.find(query)
      .populate("project", "name") // Populate project name
      // .populate("user", "name") // Optionally populate user name
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 }) // Example sort
      .lean();

    const total = await TimeEntry.countDocuments(query);

    res.status(200).json({
      timeEntries,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    console.error("Error in getAllTimeEntries:", err); // Log the actual error
    next(err); // Pass errors to Express error handler
  }
};


// --- Corrected getAllTasks ---
const getAllTasks = async (req, res, next) => {
  try { // Added try...catch
    const userId = req.user.id;
    const { projectId, priority, status, page = 1, limit = 20 } = req.query;

    // Base query for tasks assigned to the user or their subtasks
    const query = {
      $or: [{ assignedTo: userId }, { "subtasks.assignees": userId }],
    };

    if (projectId) {
      // VALIDATE projectId
      if (!mongoose.isValidObjectId(projectId)) {
        console.warn("getAllTasks: Invalid projectId format received:", projectId);
        return res.status(400).json({ error: "Invalid projectId format sent" });
      }
      // Add to query ONLY if valid
      query.project = projectId;
    }

    // Add other filters if they exist
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignedTo", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 }) // Example sort
      .lean();

    const total = await Task.countDocuments(query);

    res.status(200).json({
      tasks,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    console.error("Error in getAllTasks:", err); // Log the actual error
    next(err); // Pass errors to Express error handler
  }
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
