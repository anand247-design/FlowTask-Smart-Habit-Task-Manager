// models/Habit.js - Habit schema with streak tracking
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [80, 'Habit name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1', // indigo default
    },
    icon: {
      type: String,
      default: '⭐',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Array of ISO date strings (YYYY-MM-DD) for completion history
    completionDates: [
      {
        type: String, // Stored as 'YYYY-MM-DD'
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── Method: check if completed today ────────────────────────────────────────
habitSchema.methods.isCompletedToday = function () {
  const today = new Date().toISOString().split('T')[0];
  return this.completionDates.includes(today);
};

// ─── Method: recalculate streak ───────────────────────────────────────────────
habitSchema.methods.recalculateStreak = function () {
  const sorted = [...this.completionDates].sort().reverse();
  if (sorted.length === 0) {
    this.streak = 0;
    return;
  }

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }

  this.streak = streak;
  if (streak > this.longestStreak) this.longestStreak = streak;
};

module.exports = mongoose.model('Habit', habitSchema);
