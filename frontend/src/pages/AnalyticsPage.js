// pages/AnalyticsPage.js - Charts and productivity insights
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { analyticsService } from '../services/api';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const CHART_COLORS = {
  completed: '#22c55e',
  pending:   '#f97316',
  total:     '#6366f1',
};
const PIE_COLORS = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-sm shadow-modal">
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// Habit streak mini-grid (last 30 days)
function HabitGrid({ habit }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{habit.icon}</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {habit.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>🔥 {habit.streak} streak</span>
          <span>Best: {habit.longestStreak}</span>
          <span>Total: {habit.totalCompletions}</span>
        </div>
      </div>
      <div className="flex gap-0.5 flex-wrap">
        {habit.grid.map(({ date, completed }) => (
          <div key={date}
            className="w-4 h-4 rounded-sm transition-all"
            style={{
              background: completed ? habit.color : 'var(--border)',
              opacity: completed ? 1 : 0.5,
            }}
            title={`${date}: ${completed ? 'Done' : 'Missed'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [weekly,      setWeekly]      = useState([]);
  const [habitData,   setHabitData]   = useState([]);
  const [insights,    setInsights]    = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [wRes, hRes, pRes] = await Promise.all([
          analyticsService.getWeeklyTasks(),
          analyticsService.getHabitStreaks(),
          analyticsService.getProductivity(),
        ]);
        setWeekly(wRes.data.data);
        setHabitData(hRes.data.habits);
        setInsights(pRes.data.insights);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const priorityData = insights?.priorityDistribution?.map(p => ({
    name: p._id?.charAt(0).toUpperCase() + p._id?.slice(1),
    value: p.count,
    color: PIE_COLORS[p._id] || '#94a3b8',
  })) || [];

  const completionRate = weekly.length > 0
    ? Math.round(weekly.reduce((sum, d) => sum + (d.total > 0 ? (d.completed / d.total) * 100 : 0), 0) / weekly.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => (
          <div key={i} className="card p-5 h-64 animate-pulse" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Your productivity insights
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <TrendingUp size={22} className="text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{completionRate}%</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>7-Day Completion Rate</p>
        </div>
        <div className="card p-4 text-center">
          <Target size={22} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{insights?.totalCompleted || 0}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Total Completed</p>
        </div>
        <div className="card p-4 text-center">
          <Award size={22} className="text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {habitData.reduce((m, h) => Math.max(m, h.streak), 0)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Best Current Streak</p>
        </div>
        <div className="card p-4 text-center">
          <Zap size={22} className="text-yellow-500 mx-auto mb-2" />
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {insights?.mostProductiveDay || '–'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Most Productive Day</p>
        </div>
      </div>

      {/* Weekly tasks chart */}
      <div className="card p-5">
        <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Weekly Task Overview
        </h2>
        {weekly.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekly} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
              />
              <Bar dataKey="completed" name="Completed" fill={CHART_COLORS.completed} radius={[4,4,0,0]} />
              <Bar dataKey="pending"   name="Pending"   fill={CHART_COLORS.pending}   radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Productivity by day + Priority distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day of week */}
        <div className="card p-5">
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Productivity by Day
          </h2>
          {insights?.dayDistribution ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={insights.dayDistribution}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Tasks Completed"
                  stroke="#6366f1" fill="url(#colorProd)" strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Complete tasks to see patterns</div>
          )}
        </div>

        {/* Priority distribution */}
        <div className="card p-5">
          <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Priority Distribution
          </h2>
          {priorityData.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>No tasks yet</div>
          ) : (
            <div className="flex items-center justify-center gap-6">
              <PieChart width={180} height={180}>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
              <div className="space-y-2">
                {priorityData.map(p => (
                  <div key={p.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: p.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                    <span className="font-bold ml-auto" style={{ color: 'var(--text-primary)' }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Habit streaks grid */}
      {habitData.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>
            Habit Completion — Last 30 Days
          </h2>
          <div className="space-y-5">
            {habitData.map(h => <HabitGrid key={h._id} habit={h} />)}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Less</span>
            {[0.2, 0.4, 0.6, 0.8, 1].map(op => (
              <div key={op} className="w-3 h-3 rounded-sm bg-primary-500" style={{ opacity: op }} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
