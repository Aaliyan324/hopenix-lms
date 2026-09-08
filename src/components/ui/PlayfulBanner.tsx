import React from 'react';
import { BookOpen } from 'lucide-react';

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
  badgeIcon = <BookOpen className="w-3.5 h-3.5 text-stone-600" />,
  title,
  subtitle,
  children,
}) => {
  return (
    <div
      className="relative bg-white border border-stone-200 rounded-xl p-6 sm:p-8 md:p-10 shadow-xs overflow-hidden"
    >
      <div className="relative z-10 space-y-3">
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-md border border-stone-200 text-xs font-semibold">
            {badgeIcon}
            <span>{badgeText}</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-stone-600 max-w-2xl font-sans leading-relaxed">
          {subtitle}
        </p>

        {children && <div className="pt-2">{children}</div>}
      </div>
    </div>
  );
};

