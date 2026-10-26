// pages/CalendarPage.js - Full calendar view with task integration
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { X, Edit2, Trash2, Clock, Flag } from 'lucide-react';
import { taskService } from '../services/api';
import TaskForm from '../components/Tasks/TaskForm';
import toast from 'react-hot-toast';

// Setup date-fns localizer
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Color mapping by priority
const PRIORITY_COLORS = {
  high:   { bg: '#ef4444', border: '#dc2626' },
  medium: { bg: '#f97316', border: '#ea580c' },
  low:    { bg: '#22c55e', border: '#16a34a' },
};

// Task detail popover
function TaskPopover({ task, position, onClose, onEdit, onDelete }) {
  if (!task) return null;
  const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative card p-5 w-80 animate-slide-up shadow-modal z-10">
        {/* Color bar */}
        <div className="h-1.5 rounded-full mb-4" style={{ background: colors.bg }} />

        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-bold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {task.description && (
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              {format(new Date(task.deadline), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flag size={13} style={{ color: colors.bg }} />
            <span className={`badge-${task.priority}`}>{task.priority}</span>
            <span className={`badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => onEdit(task)}
            className="flex-1 btn-secondary flex items-center justify-center gap-1.5 py-2">
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={() => onDelete(task._id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
              text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border transition-all"
            style={{ borderColor: 'var(--border)' }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [tasks,       setTasks]       = useState([]);
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTask,    setEditTask]    = useState(null);
  const [defaultDate, setDefaultDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view,        setView]        = useState('month');
  const [date,        setDate]        = useState(new Date());

  const fetchTasks = useCallback(async () => {
    try {
      const res = await taskService.getAll();
      const ts = res.data.tasks;
      setTasks(ts);

      // Convert tasks to calendar events
      const evts = ts.map(t => {
        const colors = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.medium;
        return {
          id:    t._id,
          title: (t.status === 'completed' ? '✓ ' : '') + t.title,
          start: new Date(t.deadline),
          end:   new Date(new Date(t.deadline).getTime() + 60 * 60 * 1000), // 1hr block
          resource: t,
          style: {
            backgroundColor: t.status === 'completed' ? '#94a3b8' : colors.bg,
            borderColor:      t.status === 'completed' ? '#64748b' : colors.border,
            opacity:          t.status === 'completed' ? 0.7 : 1,
          },
        };
      });
      setEvents(evts);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Click empty slot → open create form with pre-filled date
  const handleSelectSlot = ({ start }) => {
    setEditTask(null);
    setDefaultDate(start);
    setShowForm(true);
  };

  // Click event → show detail popover
  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
  };

  const handleEdit = (task) => {
    setSelectedTask(null);
    setEditTask(task);
    setDefaultDate(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      setSelectedTask(null);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Failed to delete'); }
  };

  // Custom event style
  const eventPropGetter = (event) => ({
    style: event.style,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Click any date to add a task
          </p>
        </div>

        {/* Priority legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
            <div key={p} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: c.bg }} />
              <span className="capitalize">{p}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-400" />
            <span>Done</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card h-[600px] animate-pulse" style={{ background: 'var(--border)' }} />
      ) : (
        <div className="card p-4" style={{ height: '680px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventPropGetter}
            style={{ height: '100%' }}
            popup
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      )}

      {/* Task detail popover */}
      {selectedTask && (
        <TaskPopover
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Task form modal */}
      {showForm && (
        <TaskForm
          task={editTask}
          defaultDate={defaultDate}
          onClose={() => { setShowForm(false); setEditTask(null); setDefaultDate(null); }}
          onSave={() => { setShowForm(false); setEditTask(null); setDefaultDate(null); fetchTasks(); }}
        />
      )}
    </div>
  );
}
