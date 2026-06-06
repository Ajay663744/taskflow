const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// Helper: format validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  return null;
};

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user (with search, filter, pagination)
// @access  Private
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['all', 'pending', 'completed']).withMessage('Status must be all, pending, or completed'),
    query('search').optional().trim(),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidationErrors(req, res);
      if (validationError) return;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const status = req.query.status || 'all';
      const search = req.query.search || '';

      // Build query
      const filter = { userId: req.user.id };

      if (status !== 'all') {
        filter.status = status;
      }

      if (search) {
        filter.title = { $regex: search, $options: 'i' };
      }

      // Get total count for pagination
      const total = await Task.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      // Get tasks
      const tasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get stats (all tasks for user, regardless of filter)
      const stats = await Task.aggregate([
        { $match: { userId: req.user.id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
          },
        },
      ]);

      // Need to convert userId to ObjectId for aggregation
      const mongoose = require('mongoose');
      const statsResult = await Task.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
          },
        },
      ]);

      const taskStats = statsResult[0] || { total: 0, completed: 0, pending: 0 };

      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            currentPage: page,
            totalPages,
            totalTasks: total,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
          stats: {
            total: taskStats.total,
            completed: taskStats.completed,
            pending: taskStats.pending,
          },
        },
      });
    } catch (error) {
      console.error('Get tasks error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  }
);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be pending or completed'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidationErrors(req, res);
      if (validationError) return;

      const { title, description, status } = req.body;

      const task = new Task({
        title,
        description: description || '',
        status: status || 'pending',
        userId: req.user.id,
      });

      await task.save();

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: { task },
      });
    } catch (error) {
      console.error('Create task error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  }
);

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be pending or completed'),
  ],
  async (req, res) => {
    try {
      const validationError = handleValidationErrors(req, res);
      if (validationError) return;

      const { id } = req.params;

      // Find task and verify ownership
      const task = await Task.findOne({ _id: id, userId: req.user.id });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      // Update fields
      const { title, description, status } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;

      await task.save();

      res.json({
        success: true,
        message: 'Task updated successfully',
        data: { task },
      });
    } catch (error) {
      if (error.kind === 'ObjectId') {
        return res.status(400).json({
          success: false,
          message: 'Invalid task ID',
        });
      }
      console.error('Update task error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again later.',
      });
    }
  }
);

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task status
// @access  Private
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.status = task.status === 'pending' ? 'completed' : 'pending';
    await task.save();

    res.json({
      success: true,
      message: `Task marked as ${task.status}`,
      data: { task },
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }
    console.error('Toggle task error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }
    console.error('Delete task error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

module.exports = router;
