import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'playful';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] select-none';

  const variants = {
    primary: 'bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-800 shadow-sm',
    playful: 'bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-800 shadow-sm',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200/80',
    danger: 'bg-red-700 hover:bg-red-800 text-white border border-red-800 shadow-sm',
    outline: 'border border-stone-300 hover:border-stone-800 hover:bg-stone-50 text-stone-800',
    ghost: 'hover:bg-stone-100 text-stone-700 hover:text-stone-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 font-medium',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5 font-semibold',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

