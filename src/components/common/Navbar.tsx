import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { BookOpen, LogOut, User, Menu, X, Shield, Sparkles, LogIn, Library } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin, isEditor } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeVariant = () => {
    if (isAdmin) return 'brand';
    if (isEditor) return 'warning';
    return 'success';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 border-b border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/books" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                Hopenix <span className="text-brand-400">E-Book Portal</span>
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/books"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Library className="w-4 h-4 text-brand-400" />
              Digital Library
            </Link>
          </div>
        </div>

        {/* Right Side: User Profile / Sign In */}
        <div>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant={getRoleBadgeVariant()} size="sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </button>

              {/* User Menu Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden py-1 divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 bg-slate-900/50">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === 'STUDENT' && (
                        <Link
                          to="/student"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-brand-400" />
                          My Student Dashboard
                        </Link>
                      )}
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-brand-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
