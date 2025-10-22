const Task = require("../models/task.model");
const mongoose = require("mongoose");
const Project = require("../models/project.model");
const User = require("../models/employee.model");
const { validateTask } = require("../validators/task.validator");

// const createTask = async (req, res, next) => {
//   try {
//     console.log("PROJECT ID FROM PARAMS:", req.params.projectId);
//     const { error } = validateTask(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });

//     const project = await Project.findById(req.params.projectId);
//     if (!project) return res.status(404).json({ error: "Project not found" });
//   	
//   	// This check is fine, because your role is 'manager'
//     if (req.user.role !== "manager" && !project.teamLead.equals(req.user.id)) {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const { assignedTo } = req.body;
//     if (assignedTo && assignedTo !== '') {
//   	  const member = await User.findById(assignedTo);
//   	  if (
//   	  	!member ||
//   	  	// --- THIS IS THE FIX ---
//   	  	// We now allow 'team_member', 'manager', OR 'team_lead'
//   	  	(member.role !== "team_member" && 
//   	  	 member.role !== "manager" && 
//   	  	 member.role !== "team_lead") || // Add any other valid roles here
//   	  	// ------------------------
//   	  	!project.teamMembers.includes(assignedTo)
//   	  ) {
//   	  	return res.status(400).json({ error: "Invalid team member" });
//   	  }
//   	}

//   	const task = await Task.create({
//   	  ...req.body,
//   	  project: req.params.projectId,
//   	  createdBy: req.user.id,
//   	});
//   	res.status(201).json(task);
//   } catch (err) {
//   	next(err);
//   }
// };
const createTask = async (req, res, next) => {
  try {
    console.log("PROJECT ID FROM PARAMS:", req.params.projectId);
    const { error } = validateTask(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    
    // Check if the user creating the task is authorized
    if (req.user.role !== "manager" && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { assignedTo } = req.body;
    if (assignedTo && assignedTo !== '') {
      const member = await User.findById(assignedTo);
      if (
        !member || // Check if the assigned user exists
       
        // ----------------------------------------------------------------------
        !project.teamMembers.includes(assignedTo) // Check if user is in project team
      ) {
        return res.status(400).json({ error: "Invalid team member" });
      }
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

const createSubtask = async (req, res, next) => {
  try { // 1. Added try...catch
    const { projectId, taskId } = req.params;
    const { title, status, priority, assignees } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!title || !status || !priority) {
      // Use standard error response
      return res.status(400).json({ error: "Title, status, and priority are required" });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task || task.project.toString() !== projectId) {
      return res.status(404).json({ error: "Task not found or does not belong to this project" });
    }

    // Check if user is authorized (manager or team lead of the project)
    if (req.user.role !== "manager" && project.teamLead.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to create subtasks for this project" });
    }

    // Create subtask
    const subtask = {
      _id: new mongoose.Types.ObjectId().toString(), // 2. Added new _id
      title,
      status,
      priority,
      assignees: assignees || [],
      // 3. Removed createdAt/updatedAt as they aren't in the schema
    };

    // Add subtask to task
    task.subtasks.push(subtask);
    await task.save();

    // Return the newly created subtask
    res.status(201).json(task.subtasks[task.subtasks.length - 1]);

  } catch (err) { // 1. Added catch block
    next(err); // Pass error to Express error handler
  }
};
module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getAllTasks,
  createSubtask,
};
