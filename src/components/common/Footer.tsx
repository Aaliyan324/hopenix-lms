import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Compass, Book, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 relative transition-colors overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/20 dark:via-orange-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/login" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-orange-500 shadow-book group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-5 h-5 fill-current" />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-stone-900 dark:text-white">
                Hopenix<span className="text-orange-500">.</span>
              </span>
            </Link>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed font-sans">
              A modern digital library and publishing platform for institutions. Explore interactive e-books and lessons delivered through secure QR code access.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Navigation
            </h4>
            <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <li>
                <Link to="/login" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-block py-0.5">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Platform</h4>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
              <li className="flex items-center gap-2.5 group">
                <span className="p-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-3.5 h-3.5" />
                </span>
                Secure & Ad-Free
              </li>
              <li className="flex items-center gap-2.5 group">
                <span className="p-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Compass className="w-3.5 h-3.5" />
                </span>
                Self-Paced Reader
              </li>
              <li className="flex items-center gap-2.5 group">
                <span className="p-1 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Book className="w-3.5 h-3.5" />
                </span>
                Editorial Publishing
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
          <p>© {new Date().getFullYear()} Hopenix Digital Publishing. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            Designed for modern reading experiences with <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};