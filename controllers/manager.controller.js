const Project = require("../models/project.model");
const Client = require("../models/client.model");
const User = require("../models/employee.model");
const getManagerDashboardStats = async (req, res) => {
  try {
    // Count total projects
    const totalProjects = await Project.countDocuments();

    // Count total clients
    const totalClients = await Client.countDocuments();

    // Count total employees (users with role "employee" or "manager")
    const totalEmployees = await User.countDocuments({
      role: { $in: ["employee", "manager"] },
    });

    res.status(200).json({
      projects: totalProjects,
      clients: totalClients,
      employees: totalEmployees,
    });
  } catch (error) {
    console.error("Error fetching manager dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getManagerDashboardStats,
};
