// models/Task.js - Task schema and model
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
      index: true,
    },
    tags: [{ type: String, trim: true }],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Virtual: isOverdue ───────────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  return this.status !== 'completed' && this.deadline < new Date();
});

// ─── Static: smart schedule sort ─────────────────────────────────────────────
// Sorts by priority (high→low) then nearest deadline
taskSchema.statics.smartSort = function (tasks) {
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  return tasks.sort((a, b) => {
    const pDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.deadline) - new Date(b.deadline);
  });
};

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
