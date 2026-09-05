import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const Button = ({ children, variant = 'primary', size = 'md', loading = false, icon, className, disabled, ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm';
    const variants = {
        primary: 'bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-500 shadow-brand-500/25',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-white focus:ring-slate-500',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-500/20',
        outline: 'border border-slate-700 hover:bg-slate-800 text-slate-200 focus:ring-slate-500',
        ghost: 'hover:bg-slate-800 text-slate-300 hover:text-white shadow-none focus:ring-slate-500',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-5 py-2.5 text-base gap-2.5',
    };
    return (_jsxs("button", { className: twMerge(clsx(baseStyles, variants[variant], sizes[size], className)), disabled: disabled || loading, ...props, children: [loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : icon ? (_jsx("span", { className: "shrink-0", children: icon })) : null, _jsx("span", { children: children })] }));
};
