import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, Users, Key, QrCode, History, CheckSquare, Library, } from 'lucide-react';
export const Sidebar = ({ isOpen = true, onClose }) => {
    const { role } = useAuth().user || {};
    const publicNav = [
        { label: 'Digital Library', path: '/books', icon: Library },
    ];
    const adminNav = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Books', path: '/admin/books', icon: BookOpen },
        { label: 'Users & Roles', path: '/admin/users', icon: Users },
        { label: 'Editor Permissions', path: '/admin/permissions', icon: Key },
        { label: 'QR Code Studio', path: '/admin/qr-codes', icon: QrCode },
        { label: 'Activity Logs', path: '/admin/activity-logs', icon: History },
    ];
    const editorNav = [
        { label: 'My Assigned Books', path: '/editor', icon: CheckSquare },
    ];
    const studentNav = [
        { label: 'Library Catalog', path: '/books', icon: Library },
        { label: 'Student Dashboard', path: '/student', icon: LayoutDashboard },
    ];
    const navItems = role === 'ADMIN' ? adminNav : role === 'EDITOR' ? editorNav : studentNav;
    return (_jsxs("aside", { className: `fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col justify-between`, children: [_jsxs("div", { className: "p-4 space-y-6", children: [_jsx("div", { className: "px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider", children: role ? `${role} Workspace` : 'Digital Portal' }), _jsx("nav", { className: "space-y-1", children: navItems.map((item) => {
                            const Icon = item.icon;
                            return (_jsxs(NavLink, { to: item.path, end: item.path === '/admin' || item.path === '/editor' || item.path === '/student' || item.path === '/books', onClick: onClose, className: ({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${isActive
                                    ? 'bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'}`, children: [_jsx(Icon, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: item.label })] }, item.path));
                        }) })] }), _jsxs("div", { className: "p-4 border-t border-slate-900 text-xs text-slate-500 text-center", children: [_jsx("p", { className: "font-semibold text-slate-400", children: "Hopenix E-Book Portal v2.0" }), _jsx("p", { children: "Production Ready" })] })] }));
};
