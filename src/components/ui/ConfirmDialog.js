import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false, }) => {
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: title, maxWidth: "sm", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400", children: [_jsx(AlertTriangle, { className: "w-6 h-6 shrink-0" }), _jsx("p", { className: "text-sm font-medium", children: message })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: loading, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: onConfirm, loading: loading, children: confirmText })] })] }) }));
};
