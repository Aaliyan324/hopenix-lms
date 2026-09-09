import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { BookOpen, LogOut, Menu, X, Shield, LogIn, ChevronDown, CheckSquare } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin, isEditor } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getRoleBadgeVariant = () => {
    if (isAdmin) return 'brand';
    if (isEditor) return 'amber';
    return 'slate';
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  // Determine home link target based on role
  const getHomeLink = () => {
    if (!user) return '/login';
    if (isAdmin) return '/admin';
    if (isEditor) return '/editor';
    return '/login';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 border-b border-stone-200/80 backdrop-blur-md transition-all shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
        {/* Left Side: Logo & Primary Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          {user && onToggleSidebar && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}

          <Link to={getHomeLink()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-orange-500 shadow-book group-hover:bg-stone-800 transition-all duration-300 group-hover:scale-105">
              <BookOpen className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl text-stone-900 tracking-tight leading-none">
                Hopenix<span className="text-orange-500">.</span>
              </span>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                Digital Publishing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Role Scoped) */}
          <nav className="hidden md:flex items-center gap-2">
            {isEditor && (
              <Link
                to="/editor"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isCurrentPath('/editor')
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Assigned E-Books
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-stone-900 text-white shadow-md shadow-stone-900/10'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right Side: User Profile / Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-stone-50 hover:bg-stone-100/80 transition-all border border-stone-200/80 group"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl bg-stone-200 border border-stone-300 object-cover shadow-sm"
                />
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-bold text-stone-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-medium text-orange-600 uppercase tracking-wider">{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Menu Dropdown with AnimatePresence */}
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-editorial z-20 overflow-hidden py-1.5"
                    >
                      <div className="px-4 py-3 bg-stone-50/80 border-b border-stone-100">
                        <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
                        <div className="mt-2.5">
                          <Badge variant={getRoleBadgeVariant()} size="sm" className="bg-orange-50 text-orange-700 border-orange-200">
                            {user.role} Account
                          </Badge>
                        </div>
                      </div>

                      <div className="py-2 space-y-0.5 px-2">
                        {isEditor && (
                          <Link
                            to="/editor"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <CheckSquare className="w-4 h-4 text-stone-400" />
                            Assigned E-Books
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-stone-400" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="p-1.5 border-t border-stone-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-50 border border-stone-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-2 overflow-hidden shadow-lg"
          >
            {isEditor && (
              <Link
                to="/editor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-orange-500" />
                Assigned Books
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                <Shield className="w-4 h-4 text-orange-500" />
                Admin Dashboard
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};