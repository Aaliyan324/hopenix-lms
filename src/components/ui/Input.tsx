import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 shadow-sm transition-all focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

