// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboard, getWeeklyTaskStats, getHabitStreaks, getProductivityInsights
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard',    getDashboard);
router.get('/weekly-tasks', getWeeklyTaskStats);
router.get('/habit-streaks', getHabitStreaks);
router.get('/productivity', getProductivityInsights);

module.exports = router;
