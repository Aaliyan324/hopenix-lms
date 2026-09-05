import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toast = (message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    return (_jsxs(ToastContext.Provider, { value: { toast }, children: [children, _jsx("div", { className: "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none", children: toasts.map((item) => (_jsxs("div", { className: `pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${item.type === 'success'
                        ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                        : item.type === 'error'
                            ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                            : 'bg-blue-950/90 border-blue-800 text-blue-200'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [item.type === 'success' ? (_jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-400 shrink-0" })) : item.type === 'error' ? (_jsx(AlertCircle, { className: "w-5 h-5 text-rose-400 shrink-0" })) : (_jsx(Info, { className: "w-5 h-5 text-blue-400 shrink-0" })), _jsx("span", { className: "text-sm font-medium", children: item.message })] }), _jsx("button", { onClick: () => removeToast(item.id), className: "text-slate-400 hover:text-white p-1 rounded-md transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }, item.id))) })] }));
};
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
