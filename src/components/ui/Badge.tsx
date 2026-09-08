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
  const baseStyles = 'inline-flex items-center font-medium rounded-md border transition-all';

  const variants = {
    brand: 'bg-stone-100 text-stone-800 border-stone-300',
    purple: 'bg-stone-100 text-stone-800 border-stone-300',
    pink: 'bg-rose-50 text-rose-800 border-rose-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    orange: 'bg-orange-50 text-orange-900 border-orange-200',
    sky: 'bg-sky-50 text-sky-900 border-sky-200',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    slate: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] tracking-wide',
    md: 'px-2.5 py-1 text-xs tracking-wide',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};

