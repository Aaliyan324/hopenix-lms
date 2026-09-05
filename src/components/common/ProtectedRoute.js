import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../ui/Skeleton';
export const ProtectedRoute = ({ children, allowedRoles, }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsxs("div", { className: "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4", children: [_jsx(Skeleton, { className: "w-12 h-12 rounded-2xl" }), _jsx(Skeleton, { className: "w-48 h-4 rounded-lg" })] }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect user to their role's default dashboard
        if (user.role === 'ADMIN')
            return _jsx(Navigate, { to: "/admin", replace: true });
        if (user.role === 'EDITOR')
            return _jsx(Navigate, { to: "/editor", replace: true });
        return _jsx(Navigate, { to: "/student", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
