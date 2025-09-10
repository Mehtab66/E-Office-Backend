const Project = require("../models/project.model");
const TimeEntry = require("../models/timeEntry.model");
const Task = require("../models/task.model");

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Active projects (user is team lead or member)
    const activeProjects = await Project.countDocuments({
      $and: [
        { status: "active" },
        {
          $or: [{ teamLead: userId }, { teamMembers: userId }],
        },
      ],
    });

    // Team lead projects
    const teamLeadProjects = await Project.countDocuments({
      teamLead: userId,
    });

    // Total hours logged
    const timeEntries = await TimeEntry.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalHours: { $sum: "$hours" } } },
    ]);
    const hoursLogged = timeEntries.length > 0 ? timeEntries[0].totalHours : 0;

    // Assigned tasks (top-level or subtasks)
    const assignedTasks = await Task.countDocuments({
      $or: [{ assignedTo: userId }, { "subtasks.assignees": userId }],
    });

    res.json({
      activeProjects,
      hoursLogged,
      assignedTasks,
      teamLeadProjects,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
