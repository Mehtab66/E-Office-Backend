const Project = require("../models/project.model");
const { validateDeliverable } = require("../validators/deliverable.validator");
const Deliverable = require("../models/deliverable.model");
const User = require("../models/employee.model"); // Adjust path
const mongoose = require("mongoose");
const createDeliverable = async (req, res, next) => {
  try {
    console.log("Request body:", req.body);
    console.log("Project ID from params:", req.params.projectId);

    // Validate request body
    const { error } = validateDeliverable(req.body);
    if (error) {
      console.log("Validation error:", error.details);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }
    console.log("Validated the createDeliverable");

    // Validate projectId from params
    const projectId = req.params.projectId;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    console.log("Project found:", project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization check
    const userId = req.user.id; // Ensure req.user.id is a string or ObjectId
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(userId) &&
      !project.teamMembers.some((member) => member.equals(userId))
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: User is not a manager, team lead, or team member",
      });
    }

    // Validate createdBy
    if (!mongoose.Types.ObjectId.isValid(req.body.createdBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid createdBy ID",
      });
    }

    const user = await User.findById(req.body.createdBy);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate parent deliverable if provided
    if (req.body.parent) {
      if (!mongoose.Types.ObjectId.isValid(req.body.parent)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent deliverable ID",
        });
      }
      const parentDeliverable = await Deliverable.findById(req.body.parent);
      if (
        !parentDeliverable ||
        parentDeliverable.project.toString() !== projectId
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent deliverable",
        });
      }
    }

    // Create deliverable
    const deliverable = await Deliverable.create({
      project: projectId, // Explicitly set project field
      date: req.body.date,
      description: req.body.description,
      notes: req.body.notes,
      status: req.body.status || "pending",
      createdBy: req.body.createdBy,
      parent: req.body.parent || null,
    });

    // Populate references for response
    const populatedDeliverable = await Deliverable.findById(deliverable._id)
      .populate("createdBy", "name email")
      .populate("project", "name")
      .populate("parent", "description");

    return res.status(201).json({
      success: true,
      data: {
        id: populatedDeliverable._id,
        project: populatedDeliverable.project,
        date: populatedDeliverable.date.toISOString().split("T")[0],
        description: populatedDeliverable.description,
        notes: populatedDeliverable.notes,
        status: populatedDeliverable.status,
        createdBy: populatedDeliverable.createdBy,
        parent: populatedDeliverable.parent || null,
      },
    });
  } catch (err) {
    console.error("Error creating deliverable:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating deliverable",
      error: err.message,
    });
  }
};

const getDeliverables = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (
      !project ||
      (req.user.role !== "manager" &&
        !project.teamLead.equals(req.user.id) &&
        !project.teamMembers.includes(req.user.id))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    const deliverables = await Deliverable.find({ project: projectId })
      .populate("createdBy", "name")
      .populate("parent", "description") // Populate parent deliverable's description
      .sort({ date: -1 });
    res.json(
      deliverables.map((deliverable) => ({
        id: deliverable._id,
        project: deliverable.project,
        date: deliverable.date.toISOString().split("T")[0],
        description: deliverable.description,
        notes: deliverable.notes,
        status: deliverable.status,
        createdBy: deliverable.createdBy.name,
        parent: deliverable.parent
          ? {
              id: deliverable.parent._id,
              description: deliverable.parent.description,
            }
          : null,
      }))
    );
  } catch (error) {
    next(error);
  }
};

const getDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findById(req.params.deliverableId)
      .populate("createdBy", "name")
      .populate("parent", "description")
      .lean();
    if (!deliverable) {
      return res.status(404).json({ message: "Deliverable not found" });
    }
    const project = await Project.findById(deliverable.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.json({
      id: deliverable._id,
      project: deliverable.project,
      date: deliverable.date.toISOString().split("T")[0],
      description: deliverable.description,
      notes: deliverable.notes,
      status: deliverable.status,
      createdBy: deliverable.createdBy.name,
      parent: deliverable.parent
        ? {
            id: deliverable.parent._id,
            description: deliverable.parent.description,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

const updateDeliverable = async (req, res, next) => {
  try {
    const { error } = validateDeliverable(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const deliverable = await Deliverable.findById(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ message: "Deliverable not found" });
    }
    const project = await Project.findById(deliverable.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !deliverable.createdBy.equals(req.user.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate parent deliverable if provided
    if (req.body.parent) {
      const parentDeliverable = await Deliverable.findById(req.body.parent);
      if (
        !parentDeliverable ||
        parentDeliverable.project.toString() !== deliverable.project.toString()
      ) {
        return res.status(400).json({ message: "Invalid parent deliverable" });
      }
    }

    const updatedDeliverable = await Deliverable.findByIdAndUpdate(
      req.params.deliverableId,
      { ...req.body, project: deliverable.project }, // Ensure project ID isn't changed
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name")
      .populate("parent", "description")
      .lean();
    res.json({
      id: updatedDeliverable._id,
      project: updatedDeliverable.project,
      date: updatedDeliverable.date.toISOString().split("T")[0],
      description: updatedDeliverable.description,
      notes: updatedDeliverable.notes,
      status: updatedDeliverable.status,
      createdBy: updatedDeliverable.createdBy.name,
      parent: updatedDeliverable.parent
        ? {
            id: updatedDeliverable.parent._id,
            description: updatedDeliverable.parent.description,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

const deleteDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findById(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ message: "Deliverable not found" });
    }
    const project = await Project.findById(deliverable.project);
    if (
      req.user.role !== "manager" &&
      !project.teamLead.equals(req.user.id) &&
      !deliverable.createdBy.equals(req.user.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    // Check if other deliverables reference this one as a parent
    const childDeliverables = await Deliverable.find({
      parent: req.params.deliverableId,
    });
    if (childDeliverables.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete deliverable with linked revisions" });
    }
    await Deliverable.findByIdAndDelete(req.params.deliverableId);
    res.json({ message: "Deliverable deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDeliverable,
  getDeliverables,
  getDeliverable,
  updateDeliverable,
  deleteDeliverable,
};
