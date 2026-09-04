import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-slate-700/80',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
