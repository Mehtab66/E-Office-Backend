const { Deliverable } = require('../models/deliverable.model');
const { Project } = require('../models/project.model');

const { validateDeliverable } = require('../validators/deliverable.validator');

const createDeliverable = async (req, res, next) => {
  try {
    const { error } = validateDeliverable(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (req.user.role !== 'manager' && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deliverable = await Deliverable.create({
      ...req.body,
      project: req.params.projectId,
      createdBy: req.user.id,
    });
    res.status(201).json({
      id: deliverable._id,
      project: deliverable.project,
      date: deliverable.date.toISOString().split('T')[0],
      description: deliverable.description,
      notes: deliverable.notes,
      status: deliverable.status,
      createdBy: deliverable.createdBy,
    });
  } catch (err) {
    next(err);
  }
};

const getDeliverables = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (
      req.user.role !== 'manager' &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const deliverables = await Deliverable.find({ project: req.params.projectId })
      .populate('createdBy', 'name')
      .lean();
    res.json(deliverables.map(del => ({
      id: del._id,
      project: del.project,
      date: del.date.toISOString().split('T')[0],
      description: del.description,
      notes: del.notes,
      status: del.status,
      createdBy: del.createdBy.name,
    })));
  } catch (err) {
    next(err);
  }
};

const getDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findById(req.params.deliverableId)
      .populate('createdBy', 'name')
      .lean();
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    const project = await Project.findById(deliverable.project);
    if (
      req.user.role !== 'manager' &&
      !project.teamLead.equals(req.user.id) &&
      !project.teamMembers.includes(req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({
      id: deliverable._id,
      project: deliverable.project,
      date: deliverable.date.toISOString().split('T')[0],
      description: deliverable.description,
      notes: deliverable.notes,
      status: deliverable.status,
      createdBy: deliverable.createdBy.name,
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
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    const project = await Project.findById(deliverable.project);
    if (req.user.role !== 'manager' && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedDeliverable = await Deliverable.findByIdAndUpdate(
      req.params.deliverableId,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name')
      .lean();
    res.json({
      id: updatedDeliverable._id,
      project: updatedDeliverable.project,
      date: updatedDeliverable.date.toISOString().split('T')[0],
      description: updatedDeliverable.description,
      notes: updatedDeliverable.notes,
      status: updatedDeliverable.status,
      createdBy: updatedDeliverable.createdBy.name,
    });
  } catch (err) {
    next(err);
  }
};

const deleteDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findById(req.params.deliverableId);
    if (!deliverable) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    const project = await Project.findById(deliverable.project);
    if (req.user.role !== 'manager' && !project.teamLead.equals(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Deliverable.findByIdAndDelete(req.params.deliverableId);
    res.json({ message: 'Deliverable deleted' });
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