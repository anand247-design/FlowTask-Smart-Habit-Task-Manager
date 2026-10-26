// pages/DashboardPage.js - Overview dashboard
import React, { useState, useEffect } from 'react';
import { CheckSquare, Flame, Clock, TrendingUp, AlertCircle, Zap, Check } from 'lucide-react';
import { analyticsService, taskService, habitService } from '../services/api';
import { format, isToday } from 'date-fns';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colorMap = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    green:   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    orange:  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red:     'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  return (
    <div className="card p-5 transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats,       setStats]       = useState(null);
  const [todayTasks,  setTodayTasks]  = useState([]);
  const [habits,      setHabits]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toggling,    setToggling]    = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, todayRes, habitsRes] = await Promise.all([
          analyticsService.getDashboard(),
          taskService.getToday(),
          habitService.getAll(),
        ]);
        setStats(statsRes.data.stats);
        setTodayTasks(todayRes.data.tasks);
        setHabits(habitsRes.data.habits);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { taskService: ts } = await import('../services/api');
      await ts.update(task._id, { status: newStatus });
      setTodayTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch { toast.error('Failed to update task'); }
  };

  const handleToggleHabit = async (id) => {
    setToggling(id);
    try {
      const res = await habitService.toggle(id);
      const { completedToday, streak } = res.data;
      setHabits(prev => prev.map(h => h._id === id ? { ...h, completedToday, streak } : h));
      if (stats) {
        const diff = completedToday ? 1 : -1;
        setStats(prev => ({ ...prev, habitsCompletedToday: prev.habitsCompletedToday + diff }));
      }
    } catch { toast.error('Failed to toggle habit'); }
    finally { setToggling(null); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-5 h-28 animate-pulse" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {greeting()} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Total Tasks"    value={stats?.totalTasks || 0}    color="primary" />
        <StatCard icon={TrendingUp}  label="Completed"      value={stats?.completedTasks || 0} color="green"
          sub={`${stats?.completionRate || 0}% rate`} />
        <StatCard icon={AlertCircle} label="Overdue"        value={stats?.overdueTasks || 0}   color="red" />
        <StatCard icon={Flame}       label="Habits Today"
          value={`${stats?.habitsCompletedToday || 0}/${stats?.totalHabits || 0}`}
          color="orange"
          sub={`${stats?.habitCompletionRate || 0}% completed`} />
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Today's Tasks
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {todayTasks.length} tasks
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                No tasks due today!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => {
                const priorityDot = { high: 'bg-red-500', medium: 'bg-orange-500', low: 'bg-green-500' };
                return (
                  <div key={task._id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all
                      ${task.status === 'completed' ? 'opacity-60' : 'hover:bg-slate-50 dark:hover:bg-white/3'}`}>
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                        ${task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 dark:border-slate-600 hover:border-primary-400'
                        }`}>
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
                    <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through' : ''}`}
                      style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={11} className="inline mr-1" />
                      {format(new Date(task.deadline), 'h:mm a')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's habits */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Today's Habits</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {habits.filter(h => h.completedToday).length}/{habits.length}
            </span>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                No habits created yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map(habit => (
                <div key={habit._id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/3 transition-all cursor-pointer"
                  onClick={() => handleToggleHabit(habit._id)}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: habit.color + '20' }}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Flame size={11} style={{ color: habit.streak > 0 ? '#f97316' : 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: habit.streak > 0 ? '#f97316' : 'var(--text-muted)' }}>
                        {habit.streak} day streak
                      </span>
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    toggling === habit._id ? 'animate-spin border-2 border-dashed' : ''
                  }`}
                    style={{
                      background:  habit.completedToday ? habit.color : 'transparent',
                      border:      habit.completedToday ? 'none' : `2px solid ${habit.color}`,
                    }}>
                    {habit.completedToday && <Check size={14} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">{stats?.todayTasksCount || 0}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Due Today</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{stats?.todayCompletedCount || 0}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Done Today</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{stats?.habitCompletionRate || 0}%</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Habit Rate</p>
        </div>
      </div>
    </div>
  );
}
