import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Heart, Compass, Github, Shield, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/books" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 fill-current" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white group-hover:text-brand-300 transition-colors">
                Hopenix<span className="text-pink-500">.</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              A magical modern digital library where reading feels like an adventure. Explore interactive books, track your reading quest, and expand your horizons.
            </p>
            <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-brand-300">
                <Sparkles className="w-3.5 h-3.5" /> Interactive E-Books
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Navigation</h4>
            <ul className="space-y-2 text-sm font-semibold text-slate-400">
              <li>
                <Link to="/books" className="hover:text-brand-300 transition-colors">📚 Digital Library</Link>
              </li>
              <li>
                <Link to="/student" className="hover:text-brand-300 transition-colors">🎓 Student Dashboard</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">🔐 Sign In</Link>
              </li>
            </ul>
          </div>

          {/* Platform Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="space-y-2 text-sm font-semibold text-slate-400">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Safe & Ad-Free
              </li>
              <li className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" /> Self-Paced Learning
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" /> Built for Readers
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Hopenix E-Book Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" /> for curious minds ✨
          </p>
        </div>
      </div>
    </footer>
  );
};
