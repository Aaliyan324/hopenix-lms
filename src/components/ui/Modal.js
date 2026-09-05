import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'lg', }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const widthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '4xl': 'max-w-4xl',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity", onClick: onClose }), _jsxs("div", { className: `relative w-full ${widthClasses[maxWidth]} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200`, children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50", children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: title }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "p-6 max-h-[80vh] overflow-y-auto", children: children })] })] }));
};
