const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  createTimeEntry,
  getTimeEntries,
  getTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} = require('../controllers/timeEntryController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(authMiddleware(['manager', 'employee']), createTimeEntry)
  .get(authMiddleware(['manager', 'employee']), getTimeEntries);

router
  .route('/:timeEntryId')
  .get(authMiddleware(['manager', 'employee']), getTimeEntry)
  .put(authMiddleware(['manager', 'employee']), updateTimeEntry)
  .delete(authMiddleware(['manager', 'employee']), deleteTimeEntry);

router.put('/:timeEntryId/approve', authMiddleware(['manager', 'employee']), async (req, res, next) => {
  try {
    const { TimeEntry, Project } = require('../models');
    const timeEntry = await TimeEntry.findById(req.params.timeEntryId);
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }
    const project = await Project.findById(timeEntry.project);
    if (!project || (!project.teamLead.equals(req.user.id) && req.user.role !== 'manager')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    timeEntry.approved = req.body.approved;
    await timeEntry.save();
    res.json({
      id: timeEntry._id,
      employee: timeEntry.user,
      project: timeEntry.project,
      date: timeEntry.date.toISOString().split('T')[0],
      hours: timeEntry.hours,
      task: timeEntry.task,
      title: timeEntry.title,
      notes: timeEntry.note,
      approved: timeEntry.approved,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;