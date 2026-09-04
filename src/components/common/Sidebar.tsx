import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Key,
  QrCode,
  History,
  CheckSquare,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { role } = useAuth().user || {};

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Editor Permissions', path: '/admin/permissions', icon: Key },
    { label: 'QR Code Studio', path: '/admin/qr-codes', icon: QrCode },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: History },
  ];

  const editorNav = [
    { label: 'My Assigned Lessons', path: '/editor', icon: CheckSquare },
  ];

  const studentNav = [
    { label: 'My Enrolled Courses', path: '/student', icon: GraduationCap },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'EDITOR' ? editorNav : studentNav;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col justify-between`}
    >
      <div className="p-4 space-y-6">
        <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          {role} Workspace
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/editor' || item.path === '/student'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-900 text-xs text-slate-500 text-center">
        <p className="font-semibold text-slate-400">Hopenix LMS v1.0</p>
        <p>Production Vercel Ready</p>
      </div>
    </aside>
  );
};
