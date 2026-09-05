import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'slate' | 'purple' | 'pink' | 'amber' | 'orange' | 'sky';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-full border backdrop-blur-md shadow-xs transition-all';

  const variants = {
    brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    pink: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    orange: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px] tracking-wide',
    md: 'px-3 py-1 text-xs tracking-wide',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};
