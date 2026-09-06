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
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { role } = useAuth().user || {};

  const adminNav = [
    { label: 'Control Center', path: '/admin', icon: LayoutDashboard },
    { label: 'Books & Content', path: '/admin/books', icon: BookOpen },
    { label: 'Users & Roles', path: '/admin/users', icon: Users },
    { label: 'Permissions Matrix', path: '/admin/permissions', icon: Key },
    { label: 'QR Code Studio', path: '/admin/qr-codes', icon: QrCode },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: History },
  ];

  const editorNav = [
    { label: 'My Assigned Books', path: '/editor', icon: CheckSquare },
  ];

  const navItems = role === 'ADMIN' ? adminNav : editorNav;

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950/95 border-r border-purple-500/15 transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col justify-between backdrop-blur-xl`}
    >
      <div className="p-4 space-y-6">
        <div className="px-3 py-2 text-[11px] font-black text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {role ? `${role} WORKSPACE` : 'MAGICAL PORTAL'}
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/editor'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/25 border border-pink-400/30 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
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

      <div className="p-4 border-t border-slate-900 text-[11px] text-slate-500 text-center space-y-1">
        <p className="font-extrabold text-slate-300">Hopenix E-Book Portal</p>
        <p className="text-[10px] text-brand-400 font-semibold">Private Digital Library</p>
      </div>
    </aside>
  );
};
