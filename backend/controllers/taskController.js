// controllers/taskController.js - Full CRUD + smart scheduling
const Task = require('../models/Task');

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

// ─── Smart sort helper ────────────────────────────────────────────────────────
const smartSort = (tasks) => {
  return [...tasks].sort((a, b) => {
    const pDiff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.deadline) - new Date(b.deadline);
  });
};

// ─── Overload detection: warns if >5 tasks on the same day ───────────────────
const detectOverload = (tasks) => {
  const dayMap = {};
  tasks.forEach((t) => {
    if (t.status !== 'completed') {
      const day = new Date(t.deadline).toISOString().split('T')[0];
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
  });
  const overloaded = Object.entries(dayMap)
    .filter(([, count]) => count > 5)
    .map(([date]) => date);
  return overloaded;
};

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
const getTasks = async (req, res) => {
  try {
    const { status, priority, sort, startDate, endDate, smart } = req.query;
    const filter = { userId: req.user._id };

    if (status)    filter.status   = status;
    if (priority)  filter.priority = priority;
    if (startDate || endDate) {
      filter.deadline = {};
      if (startDate) filter.deadline.$gte = new Date(startDate);
      if (endDate)   filter.deadline.$lte = new Date(endDate);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'deadline')  sortObj = { deadline: 1 };
    if (sort === 'priority')  sortObj = { priority: -1 };
    if (sort === 'smart')     sortObj = {};

    let tasks = await Task.find(filter).sort(sortObj);

    // Apply smart scheduling if requested
    if (smart === 'true' || sort === 'smart') {
      tasks = smartSort(tasks);
    }

    const overloadedDays = detectOverload(tasks);

    res.json({ success: true, count: tasks.length, tasks, overloadedDays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority, status, tags } = req.body;
    const task = await Task.create({
      userId: req.user._id,
      title,
      description,
      deadline,
      priority: priority || 'medium',
      status:   status   || 'pending',
      tags:     tags     || [],
    });
    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Auto-stamp completedAt when marking complete
    if (updates.status === 'completed') updates.completedAt = new Date();
    if (updates.status === 'pending')   updates.completedAt = null;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/tasks/today ─────────────────────────────────────────────────────
const getTodayTasks = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId: req.user._id,
      deadline: { $gte: start, $lte: end },
    });

    res.json({ success: true, tasks: smartSort(tasks) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getTodayTasks };
