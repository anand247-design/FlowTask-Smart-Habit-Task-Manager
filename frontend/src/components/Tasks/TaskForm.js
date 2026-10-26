// components/Tasks/TaskForm.js - Modal form for create/edit tasks
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { taskService } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES   = ['pending', 'in-progress', 'completed'];

export default function TaskForm({ task, defaultDate, onClose, onSave }) {
  const isEdit = Boolean(task);
  const [form, setForm]     = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    deadline:    task?.deadline
      ? format(new Date(task.deadline), "yyyy-MM-dd'T'HH:mm")
      : defaultDate
        ? format(new Date(defaultDate), "yyyy-MM-dd'T'HH:mm")
        : '',
    priority:    task?.priority    || 'medium',
    status:      task?.status      || 'pending',
    tags:        task?.tags?.join(', ') || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.deadline)     e.deadline = 'Deadline is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await taskService.update(task._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors({}); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md card p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" className="input-field" placeholder="What needs to be done?"
              value={form.title} onChange={set('title')} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Add more details..." value={form.description} onChange={set('description')} />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Deadline <span className="text-red-500">*</span>
            </label>
            <input type="datetime-local" className="input-field"
              value={form.deadline} onChange={set('deadline')} />
            {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Priority
              </label>
              <select className="input-field" value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Status
              </label>
              <select className="input-field" value={form.status} onChange={set('status')}>
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Tags <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(comma separated)</span>
            </label>
            <input type="text" className="input-field" placeholder="work, urgent, client"
              value={form.tags} onChange={set('tags')} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
