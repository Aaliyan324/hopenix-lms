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
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, onToggle }) => {
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-20 bg-stone-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border-r border-stone-200/80 dark:border-stone-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col justify-between shadow-xl lg:shadow-none`}
      >
        <div className="p-5 space-y-6">
          {/* Header section with Workspace Title and Collapse Toggle */}
          <div className="px-3 py-2 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest flex items-center justify-between border-b border-stone-100 dark:border-stone-800">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              {role ? `${role} WORKSPACE` : 'EDITORIAL PORTAL'}
            </span>
            
            {/* Desktop Sidebar Toggle Button */}
            {onToggle && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onToggle}
                className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
              >
                {isOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>

          {/* Navigation Links */}
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
                    `relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-stone-900 dark:bg-orange-500 text-white shadow-md shadow-stone-900/10 dark:shadow-orange-500/25'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-orange-50/60 dark:hover:bg-orange-950/30'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-orange-400 dark:text-white'
                            : 'text-stone-400 dark:text-stone-400 group-hover:text-orange-500'
                        }`}
                      />
                      <span className="tracking-wide">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-orange-400 dark:bg-white"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info badge */}
        <div className="p-5 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 text-center space-y-1 bg-stone-50/50 dark:bg-stone-900/50">
          <p className="font-bold text-stone-800 dark:text-stone-200">Hopenix E-Book Portal</p>
          <p className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold tracking-wider uppercase flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> Digital Library Engine
          </p>
        </div>
      </aside>
    </>
  );
};