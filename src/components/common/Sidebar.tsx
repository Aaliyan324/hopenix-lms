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
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-stone-50 border-r border-stone-200 transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col justify-between backdrop-blur-md`}
    >
      <div className="p-4 space-y-6">
        <div className="px-3 py-2 text-[10px] font-semibold text-stone-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-200">
          {role ? `${role} WORKSPACE` : 'EDITORIAL PORTAL'}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/editor'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-stone-900 text-stone-50 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
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

      <div className="p-4 border-t border-stone-200 text-[11px] text-stone-500 text-center space-y-1">
        <p className="font-semibold text-stone-800">Hopenix E-Book Portal</p>
        <p className="text-[10px] text-stone-500 font-medium">Digital Library Platform</p>
      </div>
    </aside>
  );
};

