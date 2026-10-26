// pages/HabitsPage.js - Habit tracker view
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Flame, X, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { habitService } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1','#f43f5e','#f97316','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899'];
const ICONS  = ['⭐','💪','📚','🧘','🏃','💧','🎯','🌱','✍️','🍎','😴','🎨'];

// ── Habit Form Modal ───────────────────────────────────────────────────────────
function HabitForm({ habit, onClose, onSave }) {
  const isEdit = Boolean(habit);
  const [form, setForm] = useState({
    name:        habit?.name        || '',
    description: habit?.description || '',
    color:       habit?.color       || '#6366f1',
    icon:        habit?.icon        || '⭐',
    frequency:   habit?.frequency   || 'daily',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Habit name is required'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await habitService.update(habit._id, form);
        toast.success('Habit updated');
      } else {
        await habitService.create(form);
        toast.success('Habit created! 🎉');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon preview */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
              style={{ background: form.color + '20', border: `2px solid ${form.color}` }}>
              {form.icon}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} type="button"
                  onClick={() => setForm(p => ({ ...p, icon }))}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all
                    ${form.icon === icon ? 'ring-2 scale-110' : 'hover:scale-105'}`}
                  style={form.icon === icon ? { ringColor: form.color, background: form.color + '20' } : { background: 'var(--bg)' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Color</label>
            <div className="flex gap-2">
              {COLORS.map(color => (
                <button key={color} type="button"
                  onClick={() => setForm(p => ({ ...p, color }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ background: color, ringColor: color }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Name</label>
            <input type="text" className="input-field" placeholder="e.g. Morning workout"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
            <input type="text" className="input-field" placeholder="Optional description"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Habit Card ─────────────────────────────────────────────────────────────────
function HabitCard({ habit, onToggle, onEdit, onDelete, toggling }) {
  const today = new Date().toISOString().split('T')[0];

  // Build last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    return { date: ds, completed: habit.completionDates?.includes(ds), isToday: ds === today };
  });

  return (
    <div className="card p-5 transition-all duration-200 hover:shadow-card-hover animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: habit.color + '20' }}>
          {habit.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{habit.name}</h3>
              {habit.description && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{habit.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onEdit(habit)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                <Edit2 size={14} />
              </button>
              <button onClick={() => onDelete(habit._id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Flame size={14} style={{ color: habit.streak > 0 ? '#f97316' : 'var(--text-muted)' }} />
              <span className="text-sm font-bold" style={{ color: habit.streak > 0 ? '#f97316' : 'var(--text-muted)' }}>
                {habit.streak}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>day streak</span>
            </div>
            {habit.longestStreak > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Best: {habit.longestStreak}
              </span>
            )}
          </div>

          {/* 7-day grid */}
          <div className="flex items-center gap-1 mt-3">
            {last7.map(({ date, completed, isToday }) => (
              <div key={date} className="flex flex-col items-center gap-0.5">
                <div className={`w-7 h-7 rounded-lg transition-all ${
                  completed
                    ? 'shadow-sm'
                    : isToday
                    ? 'border-2'
                    : ''
                }`}
                  style={{
                    background:   completed ? habit.color : 'var(--bg)',
                    borderColor:  isToday && !completed ? habit.color : undefined,
                  }}>
                  {completed && <Check size={12} className="text-white m-auto mt-1.5" />}
                </div>
                <span className="text-[9px]" style={{ color: isToday ? habit.color : 'var(--text-muted)' }}>
                  {new Date(date).toLocaleDateString('en', { weekday: 'narrow' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complete today button */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onToggle(habit._id)}
          disabled={toggling === habit._id}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            habit.completedToday
              ? 'text-white shadow-sm'
              : 'border-2'
          }`}
          style={{
            background:   habit.completedToday ? habit.color : 'transparent',
            borderColor:  habit.completedToday ? habit.color : habit.color,
            color:        habit.completedToday ? 'white' : habit.color,
          }}>
          {toggling === habit._id
            ? <Loader2 size={15} className="animate-spin" />
            : habit.completedToday
            ? <><Check size={15} /> Completed Today</>
            : '+ Mark Complete'
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function HabitsPage() {
  const [habits,   setHabits]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [toggling, setToggling] = useState(null);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await habitService.getAll();
      setHabits(res.data.habits);
    } catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await habitService.toggle(id);
      const { completedToday, streak } = res.data;
      setHabits(prev => prev.map(h => h._id === id ? { ...h, completedToday, streak } : h));
      toast.success(completedToday ? '🔥 Habit completed!' : 'Habit unchecked');
    } catch { toast.error('Failed to toggle habit'); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this habit?')) return;
    try {
      await habitService.delete(id);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit archived');
    } catch { toast.error('Failed to delete'); }
  };

  const completedToday = habits.filter(h => h.completedToday).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Habits</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {completedToday}/{habits.length} completed today
          </p>
        </div>
        <button onClick={() => { setEditHabit(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2].map(i => (
            <div key={i} className="card p-5 h-44 animate-pulse" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌱</div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No habits yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Build positive routines, one day at a time
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {habits.map(h => (
            <HabitCard
              key={h._id}
              habit={h}
              onToggle={handleToggle}
              onEdit={(h) => { setEditHabit(h); setShowForm(true); }}
              onDelete={handleDelete}
              toggling={toggling}
            />
          ))}
        </div>
      )}

      {showForm && (
        <HabitForm
          habit={editHabit}
          onClose={() => { setShowForm(false); setEditHabit(null); }}
          onSave={() => { setShowForm(false); setEditHabit(null); fetchHabits(); }}
        />
      )}
    </div>
  );
}
