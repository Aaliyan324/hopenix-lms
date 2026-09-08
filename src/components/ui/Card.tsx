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
          'bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm transition-all duration-200',
          hoverable && 'hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

