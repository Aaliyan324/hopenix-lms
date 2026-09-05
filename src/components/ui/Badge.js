import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const Badge = ({ children, variant = 'slate', size = 'sm', className, }) => {
    const baseStyles = 'inline-flex items-center font-semibold rounded-full border shadow-sm';
    const variants = {
        brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        slate: 'bg-slate-800 text-slate-300 border-slate-700',
    };
    const sizes = {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };
    return (_jsx("span", { className: twMerge(clsx(baseStyles, variants[variant], sizes[size], className)), children: children }));
};
