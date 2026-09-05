import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Input = ({ label, error, className = '', ...props }) => {
    return (_jsxs("div", { className: "space-y-1 text-left w-full", children: [label && _jsx("label", { className: "block text-xs font-semibold text-slate-300 uppercase tracking-wider", children: label }), _jsx("input", { className: `w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors ${className}`, ...props }), error && _jsx("p", { className: "text-[11px] text-rose-400 font-medium", children: error })] }));
};
