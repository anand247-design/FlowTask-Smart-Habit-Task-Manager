// controllers/analyticsController.js - Dashboard stats and productivity insights
const Task = require('../models/Task');
const Habit = require('../models/Habit');

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Today boundaries
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(now); todayEnd.setHours(23,59,59,999);

    // Week boundaries
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      todayTasks,
      habits,
    ] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: 'pending' }),
      Task.countDocuments({ userId, status: { $ne: 'completed' }, deadline: { $lt: now } }),
      Task.find({ userId, deadline: { $gte: todayStart, $lte: todayEnd } }),
      Habit.find({ userId, isActive: true }),
    ]);

    const today = now.toISOString().split('T')[0];
    const habitsCompletedToday = habits.filter((h) => h.completionDates.includes(today)).length;

    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        todayTasksCount: todayTasks.length,
        todayCompletedCount: todayTasks.filter((t) => t.status === 'completed').length,
        totalHabits: habits.length,
        habitsCompletedToday,
        habitCompletionRate: habits.length > 0
          ? Math.round((habitsCompletedToday / habits.length) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/analytics/weekly-tasks ─────────────────────────────────────────
const getWeeklyTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = [];

    // Build last 7 days data
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end   = new Date(d); end.setHours(23,59,59,999);

      const [total, completed] = await Promise.all([
        Task.countDocuments({ userId, deadline: { $gte: start, $lte: end } }),
        Task.countDocuments({ userId, deadline: { $gte: start, $lte: end }, status: 'completed' }),
      ]);

      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        total,
        completed,
        pending: total - completed,
      });
    }

    res.json({ success: true, data: days });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/analytics/habit-streaks ────────────────────────────────────────
const getHabitStreaks = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id, isActive: true })
      .select('name streak longestStreak color icon completionDates');

    // Build last 30-day completion grid per habit
    const habitsWithGrid = habits.map((h) => {
      const grid = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        grid.push({ date: dateStr, completed: h.completionDates.includes(dateStr) });
      }
      return {
        _id: h._id,
        name: h.name,
        streak: h.streak,
        longestStreak: h.longestStreak,
        color: h.color,
        icon: h.icon,
        grid,
        totalCompletions: h.completionDates.length,
      };
    });

    res.json({ success: true, habits: habitsWithGrid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/analytics/productivity ─────────────────────────────────────────
const getProductivityInsights = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({ userId, status: 'completed', completedAt: { $exists: true } });

    // Most productive day of week
    const dayCount = new Array(7).fill(0);
    tasks.forEach((t) => {
      if (t.completedAt) dayCount[new Date(t.completedAt).getDay()]++;
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mostProductiveDay = days[dayCount.indexOf(Math.max(...dayCount))];

    // Priority distribution
    const priorityStats = await Task.aggregate([
      { $match: { userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      insights: {
        mostProductiveDay,
        dayDistribution: days.map((d, i) => ({ day: d, count: dayCount[i] })),
        priorityDistribution: priorityStats,
        totalCompleted: tasks.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getWeeklyTaskStats, getHabitStreaks, getProductivityInsights };
