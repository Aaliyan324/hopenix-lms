import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-slate-900/95 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all duration-300',
          hoverable && 'hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-brand-500/10 hover:shadow-2xl',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
