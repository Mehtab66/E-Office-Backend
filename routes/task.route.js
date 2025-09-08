const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(authMiddleware(['manager', 'employee']), createTask)
  .get(authMiddleware(['manager', 'employee']), getTasks);

router
  .route('/:taskId')
  .get(authMiddleware(['manager', 'employee']), getTask)
  .put(authMiddleware(['manager', 'employee']), updateTask)
  .delete(authMiddleware(['manager', 'employee']), deleteTask);

router.post('/:taskId/subtasks', authMiddleware(['manager', 'employee']), async (req, res, next) => {
  try {
    const { Task, Project } = require('../models');
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const project = await Project.findById(task.project);
    if (!project || (!project.teamLead.equals(req.user.id) && req.user.role !== 'manager')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const subtask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title,
      status: req.body.status || 'todo',
      assignees: req.body.assignees || [],
    };
    task.subtasks.push(subtask);
    await task.save();
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
});

module.exports = router;