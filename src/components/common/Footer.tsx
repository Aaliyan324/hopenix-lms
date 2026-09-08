import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Compass, Book } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/login" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-stone-50 shadow-xs">
                <BookOpen className="w-4 h-4 fill-current" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-stone-900">
                Hopenix<span className="text-stone-400">.</span>
              </span>
            </Link>
            <p className="text-xs text-stone-600 max-w-sm leading-relaxed font-sans">
              A modern digital library and publishing platform for institutions. Explore interactive e-books and lessons delivered through secure QR code access.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
              <li>
                <Link to="/login" className="hover:text-stone-900 transition-colors">Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">Platform</h4>
            <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-stone-700" /> Secure & Ad-Free
              </li>
              <li className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-stone-700" /> Self-Paced Reader
              </li>
              <li className="flex items-center gap-2">
                <Book className="w-3.5 h-3.5 text-stone-700" /> Editorial Publishing
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-medium">
          <p>© {new Date().getFullYear()} Hopenix Digital Publishing. All rights reserved.</p>
          <p className="text-stone-500">Designed for modern reading experiences.</p>
        </div>
      </div>
    </footer>
  );
};

