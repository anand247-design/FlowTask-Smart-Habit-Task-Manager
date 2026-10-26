// routes/habitRoutes.js
const express = require('express');
const router = express.Router();
const {
  getHabits, getHabit, createHabit, updateHabit, deleteHabit, toggleHabitCompletion
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getHabits).post(createHabit);
router.route('/:id').get(getHabit).put(updateHabit).delete(deleteHabit);
router.post('/:id/toggle', toggleHabitCompletion);

module.exports = router;
