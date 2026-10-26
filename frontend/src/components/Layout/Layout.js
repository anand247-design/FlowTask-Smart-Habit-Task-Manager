// components/Layout/Layout.js - App shell with sidebar + topbar
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Flame, Calendar, BarChart2,
  LogOut, Sun, Moon, Menu, X, Zap, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
  { to: '/habits',    icon: Flame,           label: 'Habits'    },
  { to: '/calendar',  icon: Calendar,        label: 'Calendar'  },
  { to: '/analytics', icon: BarChart2,       label: 'Analytics' },
];

export default function Layout() {
  const { user, logout, toggleDarkMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isDark = document.documentElement.classList.contains('dark');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
          border-r transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `} style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 h-16 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
              FlowTask
            </span>
            <button
              className="ml-auto lg:hidden p-1 rounded"
              onClick={() => setSidebarOpen(false)}
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5'
                  }
                `}
                style={({ isActive }) => isActive ? {} : { color: 'var(--text-secondary)' }}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="px-3 pb-4 space-y-1 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all hover:bg-slate-100 dark:hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar (mobile) */}
        <header className="lg:hidden flex items-center px-4 h-14 border-b gap-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-secondary)' }}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>FlowTask</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
