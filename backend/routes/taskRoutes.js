// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTasks, getTask, createTask, updateTask, deleteTask, getTodayTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/today', getTodayTasks);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);

module.exports = router;
