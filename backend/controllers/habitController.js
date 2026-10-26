// controllers/habitController.js - Habit CRUD + streak management
const Habit = require('../models/Habit');

// ─── GET /api/habits ──────────────────────────────────────────────────────────
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    const today = new Date().toISOString().split('T')[0];

    // Annotate each habit with today's completion status
    const habitsWithStatus = habits.map((h) => ({
      ...h.toObject(),
      completedToday: h.completionDates.includes(today),
    }));

    res.json({ success: true, count: habits.length, habits: habitsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/habits/:id ──────────────────────────────────────────────────────
const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, habit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/habits ─────────────────────────────────────────────────────────
const createHabit = async (req, res) => {
  try {
    const { name, description, color, icon, frequency } = req.body;
    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description,
      color:     color     || '#6366f1',
      icon:      icon      || '⭐',
      frequency: frequency || 'daily',
    });
    res.status(201).json({ success: true, habit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/habits/:id ──────────────────────────────────────────────────────
const updateHabit = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { name, description, color, icon } },
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, habit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/habits/:id ───────────────────────────────────────────────────
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, message: 'Habit archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/habits/:id/toggle ─────────────────────────────────────────────
// Toggle today's completion and recalculate streak
const toggleHabitCompletion = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const alreadyCompleted = habit.completionDates.includes(today);

    if (alreadyCompleted) {
      // Undo today's completion
      habit.completionDates = habit.completionDates.filter((d) => d !== today);
    } else {
      // Mark as complete today
      habit.completionDates.push(today);
    }

    // Recalculate streak
    habit.recalculateStreak();
    await habit.save();

    res.json({
      success: true,
      completedToday: !alreadyCompleted,
      streak: habit.streak,
      habit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHabits, getHabit, createHabit, updateHabit, deleteHabit, toggleHabitCompletion };
