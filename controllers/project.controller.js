const Project = require("../models/project.model");
const { validateProject } = require("../validators/project.validator");

// Controller to add a new project
const addProject = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateProject(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const {
      name,
      client,
      status,
      startDate,
      estimatedTime,
      teamLead,
      teamMembers,
    } = req.body;

    // Check if client exists
    const existingClient = await Client.findOne({ name: client });
    if (!existingClient) {
      return res.status(400).json({ message: "Client does not exist" });
    }

    // Create new project
    const project = new Project({
      name,
      client,
      status,
      startDate: new Date(startDate),
      estimatedTime,
      teamLead,
      teamMembers: teamMembers.split(", ").filter(Boolean),
    });

    await project.save();

    res.status(201).json({ message: "Project added successfully", project });
  } catch (error) {
    console.error("Error adding project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addProject };
