import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';
export const EmptyState = ({ title, description, actionText, onAction, icon, }) => {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/40 my-6", children: [_jsx("div", { className: "p-4 rounded-full bg-slate-800/80 text-brand-400 mb-4 ring-8 ring-slate-800/30", children: icon || _jsx(FolderOpen, { className: "w-8 h-8" }) }), _jsx("h3", { className: "text-lg font-semibold text-white mb-1", children: title }), _jsx("p", { className: "text-sm text-slate-400 max-w-sm mb-6", children: description }), actionText && onAction && (_jsx(Button, { onClick: onAction, variant: "primary", children: actionText }))] }));
};
