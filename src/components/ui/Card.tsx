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
          'bg-white border border-stone-200/80 rounded-2xl p-6 shadow-[0_1px_2px_rgba(28,25,23,0.04),0_8px_24px_-16px_rgba(28,25,23,0.14)] transition-all duration-200',
          hoverable && 'hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_18px_40px_-20px_rgba(234,88,12,0.24),0_6px_16px_-8px_rgba(28,25,23,0.10)]',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

