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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99] select-none';

  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white border border-orange-600 hover:border-orange-700 shadow-sm shadow-orange-600/20',
    playful: 'bg-stone-900 hover:bg-stone-800 text-stone-50 border border-stone-800 shadow-sm',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 shadow-sm shadow-red-600/20',
    outline: 'bg-white border border-stone-300 hover:border-orange-400 hover:bg-orange-50 text-stone-700 hover:text-orange-700',
    ghost: 'hover:bg-stone-100 text-stone-600 hover:text-stone-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5 sm:text-base',
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

