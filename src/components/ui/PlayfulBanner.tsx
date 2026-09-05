import React from 'react';
import { Sparkles, BookOpen, Star, Compass } from 'lucide-react';

interface PlayfulBannerProps {
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  variant?: 'purple' | 'pink' | 'amber' | 'emerald';
}

export const PlayfulBanner: React.FC<PlayfulBannerProps> = ({
  badgeText,
  badgeIcon = <Sparkles className="w-4 h-4 text-amber-300" />,
  title,
  subtitle,
  children,
  variant = 'purple',
}) => {
  const gradientMap = {
    purple: 'from-purple-950 via-slate-900 to-brand-950 border-purple-500/30',
    pink: 'from-pink-950 via-slate-900 to-purple-950 border-pink-500/30',
    amber: 'from-amber-950 via-slate-900 to-purple-950 border-amber-500/30',
    emerald: 'from-emerald-950 via-slate-900 to-brand-950 border-emerald-500/30',
  };

  const glowMap = {
    purple: 'bg-brand-500/20',
    pink: 'bg-pink-500/20',
    amber: 'bg-amber-500/20',
    emerald: 'bg-emerald-500/20',
  };

  return (
    <div
      className={`relative bg-gradient-to-r ${gradientMap[variant]} border rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className={`absolute top-0 right-0 w-80 h-80 ${glowMap[variant]} rounded-full blur-3xl pointer-events-none`} />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Floating Sparkles */}
      <div className="absolute right-8 top-8 text-amber-300/30 animate-pulse pointer-events-none hidden sm:block">
        <Star className="w-8 h-8" />
      </div>
      <div className="absolute right-28 bottom-6 text-purple-300/30 animate-float pointer-events-none hidden md:block">
        <Sparkles className="w-10 h-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 text-white rounded-full border border-white/15 text-xs font-extrabold backdrop-blur-md shadow-md">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-slate-200 max-w-2xl font-medium leading-relaxed">
          {subtitle}
        </p>

        {children && <div className="pt-4">{children}</div>}
      </div>
    </div>
  );
};
