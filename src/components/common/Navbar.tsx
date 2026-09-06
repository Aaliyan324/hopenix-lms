import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { BookOpen, LogOut, Menu, X, Shield, LogIn, ChevronDown, CheckSquare } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

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
    if (isAdmin) return 'purple';
    if (isEditor) return 'amber';
    return 'pink';
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
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 border-b border-purple-500/15 backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        {/* Left Side: Logo & Primary Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={getHomeLink()} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-all duration-300">
              <BookOpen className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-white tracking-tight leading-none group-hover:text-brand-300 transition-colors">
                Hopenix<span className="text-pink-500">.</span>
              </span>
              <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider">
                E-Book Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Role Scoped) */}
          <nav className="hidden md:flex items-center gap-2">
            {isEditor && (
              <Link
                to="/editor"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                  isCurrentPath('/editor')
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-amber-400" />
                My Assigned E-Books
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right Side: User Profile / Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 transition-all border border-purple-500/20 hover:border-purple-500/40 shadow-md group"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full bg-slate-950 border border-brand-400/40 object-cover"
                />
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-extrabold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] font-bold text-brand-400">{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-3 w-64 bg-slate-900/95 border border-purple-500/25 rounded-2xl shadow-2xl z-20 overflow-hidden py-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-950/60 to-slate-900 border-b border-slate-800">
                      <p className="text-sm font-extrabold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <div className="mt-2">
                        <Badge variant={getRoleBadgeVariant()} size="sm">
                          ✨ {user.role} Account
                        </Badge>
                      </div>
                    </div>

                    <div className="py-2 space-y-1 px-2">
                      {isEditor && (
                        <Link
                          to="/editor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-200 hover:bg-amber-500/10 hover:text-amber-300 transition-colors"
                        >
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                          Assigned E-Books
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-200 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-purple-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-rose-400 hover:bg-rose-500/10 transition-colors"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg shadow-brand-500/25 border border-pink-400/30 hover:scale-105 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          {isEditor && (
            <Link
              to="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-200 hover:bg-slate-900"
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              Assigned Books
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-200 hover:bg-slate-900"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
