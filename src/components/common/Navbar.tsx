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
    <header className="sticky top-0 z-40 w-full bg-white/95 border-b border-stone-200/80 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
        {/* Left Side: Logo & Primary Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={getHomeLink()} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center text-stone-50 shadow-xs group-hover:bg-stone-800 transition-all">
              <BookOpen className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl text-stone-900 tracking-tight leading-none">
                Hopenix<span className="text-stone-400">.</span>
              </span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest mt-0.5">
                Digital Publishing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Role Scoped) */}
          <nav className="hidden md:flex items-center gap-2">
            {isEditor && (
              <Link
                to="/editor"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isCurrentPath('/editor')
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Assigned E-Books
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
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
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-lg bg-stone-50 hover:bg-stone-100 transition-all border border-stone-200 group"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-stone-200 border border-stone-300 object-cover"
                />
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-semibold text-stone-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] font-medium text-stone-500">{user.role}</p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-200">
                      <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      <div className="mt-2">
                        <Badge variant={getRoleBadgeVariant()} size="sm">
                          {user.role} Account
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1.5 space-y-0.5 px-1.5">
                      {isEditor && (
                        <Link
                          to="/editor"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <CheckSquare className="w-4 h-4 text-stone-600" />
                          Assigned E-Books
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-stone-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="p-1.5 border-t border-stone-200">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
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
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg transition-all shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 bg-stone-50 border border-stone-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          {isEditor && (
            <Link
              to="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100"
            >
              <CheckSquare className="w-4 h-4 text-stone-600" />
              Assigned Books
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-100"
            >
              <Shield className="w-4 h-4 text-stone-600" />
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

