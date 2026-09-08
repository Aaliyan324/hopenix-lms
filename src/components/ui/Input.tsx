import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

