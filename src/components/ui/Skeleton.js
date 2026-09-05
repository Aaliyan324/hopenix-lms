import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const Skeleton = ({ className }) => {
    return (_jsx("div", { className: twMerge(clsx('animate-pulse bg-slate-800/60 rounded-lg', className)) }));
};
