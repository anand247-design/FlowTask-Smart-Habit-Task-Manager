// components/Tasks/TaskCard.js - Individual task card
import React from 'react';
import { Calendar, Edit2, Trash2, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const priorityColors = {
  high:   { dot: 'bg-red-500',    badge: 'badge-high'   },
  medium: { dot: 'bg-orange-500', badge: 'badge-medium' },
  low:    { dot: 'bg-green-500',  badge: 'badge-low'    },
};

const statusBadge = {
  pending:     'badge-pending',
  'in-progress': 'badge-in-progress',
  completed:   'badge-completed',
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const deadline = new Date(task.deadline);
  const isOverdue = task.status !== 'completed' && isPast(deadline) && !isToday(deadline);
  const pc = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div className={`card p-4 transition-all duration-200 hover:shadow-card-hover animate-fade-in
      ${task.status === 'completed' ? 'opacity-60' : ''}
      ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
    `}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
            ${task.status === 'completed'
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
            }`}
        >
          {task.status === 'completed' && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through' : ''}`}
              style={{ color: 'var(--text-primary)' }}>
              {task.title}
            </h3>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pc.dot}`} />
          </div>

          {task.description && (
            <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className={pc.badge}>{task.priority}</span>
            <span className={statusBadge[task.status]}>{task.status.replace('-', ' ')}</span>

            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : ''}`}
              style={!isOverdue ? { color: 'var(--text-muted)' } : {}}>
              {isOverdue ? <Clock size={11} /> : <Calendar size={11} />}
              {isToday(deadline)
                ? `Today ${format(deadline, 'h:mm a')}`
                : format(deadline, 'MMM d, yyyy')}
            </div>

            {task.tags?.length > 0 && task.tags.map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          <button onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
