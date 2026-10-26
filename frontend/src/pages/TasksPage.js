// pages/TasksPage.js - Full task management view
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, SlidersHorizontal, Zap, AlertTriangle } from 'lucide-react';
import { taskService } from '../services/api';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';
import toast from 'react-hot-toast';

const FILTERS = [
  { label: 'All',       value: '' },
  { label: 'Pending',   value: 'pending' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Completed', value: 'completed' },
];
const PRIORITIES = [
  { label: 'All Priority', value: '' },
  { label: 'High',   value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low',    value: 'low' },
];
const SORTS = [
  { label: 'Newest',   value: '' },
  { label: 'Smart Sort ⚡', value: 'smart' },
  { label: 'Deadline', value: 'deadline' },
  { label: 'Priority', value: 'priority' },
];

export default function TasksPage() {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort,         setSort]         = useState('smart');
  const [showForm,     setShowForm]     = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [overloaded,   setOverloaded]   = useState([]);

  const fetchTasks = useCallback(async () => {
    try {
      const params = { smart: sort === 'smart', sort };
      if (statusFilter)   params.status   = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await taskService.getAll(params);
      setTasks(res.data.tasks);
      setOverloaded(res.data.overloadedDays || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, sort]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await taskService.update(task._id, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    } catch { toast.error('Failed to update task'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleEdit = (task) => { setEditTask(task); setShowForm(true); };

  const handleFormClose = () => { setShowForm(false); setEditTask(null); };

  const handleSave = () => { handleFormClose(); fetchTasks(); };

  // Client-side search filter
  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {completedCount} of {tasks.length} completed
          </p>
        </div>
        <button onClick={() => { setEditTask(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Overall Progress
            </span>
            <span className="text-sm font-bold text-primary-500">{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-2 rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Overload warning */}
      {overloaded.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Overloaded days detected</p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
              These dates have 5+ tasks: {overloaded.join(', ')}. Consider spreading tasks out.
            </p>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" className="input-field pl-9 py-2"
            placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {FILTERS.map(f => (
            <button key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? 'bg-primary-500 text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
              style={statusFilter !== f.value ? { color: 'var(--text-secondary)' } : {}}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Priority */}
        <select className="input-field py-2 w-auto" value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
          <select className="input-field py-2 w-auto" value={sort}
            onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tasks list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-4 h-20 animate-pulse" style={{ background: 'var(--border)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-primary-500" />
          </div>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {search ? 'No tasks match your search' : 'No tasks yet'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {search ? 'Try a different query' : 'Create your first task to get started'}
          </p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sort === 'smart' && (
            <div className="flex items-center gap-2 text-xs font-medium px-1" style={{ color: 'var(--text-muted)' }}>
              <Zap size={12} className="text-primary-500" />
              Smart sorted by priority & deadline
            </div>
          )}
          {filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={editTask}
          onClose={handleFormClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
