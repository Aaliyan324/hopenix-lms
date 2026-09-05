import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const Card = ({ children, className, ...props }) => {
    return (_jsx("div", { className: twMerge(clsx('bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-slate-700/80', className)), ...props, children: children }));
};
