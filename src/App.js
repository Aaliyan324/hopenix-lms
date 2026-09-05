import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
// Public Pages
import { PublicBooksPage } from './pages/public/PublicBooksPage';
import { PublicBookDetailPage } from './pages/public/PublicBookDetailPage';
import { PublicLessonReaderPage } from './pages/public/PublicLessonReaderPage';
import { LoginPage } from './pages/auth/LoginPage';
// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminBookDetailPage } from './pages/admin/AdminBookDetailPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminQRCodesPage } from './pages/admin/AdminQRCodesPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';
// Editor Pages
import { EditorDashboardPage } from './pages/editor/EditorDashboardPage';
import { LessonEditPage } from './pages/editor/LessonEditPage';
// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
// Portal Layout with Navbar & Sidebar
const PortalLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white", children: [_jsx(Navbar, { onToggleSidebar: () => setSidebarOpen(!sidebarOpen) }), _jsxs("div", { className: "flex flex-1 relative", children: [user && _jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsx("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full", children: _jsx(Outlet, {}) })] })] }));
};
// Root index redirector
const RootRedirect = () => {
    const { user, loading } = useAuth();
    if (loading)
        return null;
    if (!user)
        return _jsx(Navigate, { to: "/books", replace: true });
    if (user.role === 'ADMIN')
        return _jsx(Navigate, { to: "/admin", replace: true });
    if (user.role === 'EDITOR')
        return _jsx(Navigate, { to: "/editor", replace: true });
    return _jsx(Navigate, { to: "/books", replace: true });
};
export const App = () => {
    return (_jsx(BrowserRouter, { children: _jsx(ToastProvider, { children: _jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { element: _jsx(PortalLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(RootRedirect, {}) }), _jsx(Route, { path: "/books", element: _jsx(PublicBooksPage, {}) }), _jsx(Route, { path: "/books/:slug", element: _jsx(PublicBookDetailPage, {}) }), _jsx(Route, { path: "/books/:slug/lessons/:lessonNumber", element: _jsx(PublicLessonReaderPage, {}) }), _jsx(Route, { path: "/courses/:slug", element: _jsx(PublicBookDetailPage, {}) }), _jsx(Route, { path: "/courses/:courseSlug/lessons/:lessonSlug", element: _jsx(PublicLessonReaderPage, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoute, { allowedRoles: ['ADMIN'], children: _jsx(PortalLayout, {}) }), children: [_jsx(Route, { path: "/admin", element: _jsx(AdminDashboardPage, {}) }), _jsx(Route, { path: "/admin/books", element: _jsx(AdminBooksPage, {}) }), _jsx(Route, { path: "/admin/books/new", element: _jsx(AdminBooksPage, {}) }), _jsx(Route, { path: "/admin/books/:id/edit", element: _jsx(AdminBookDetailPage, {}) }), _jsx(Route, { path: "/admin/courses", element: _jsx(Navigate, { to: "/admin/books", replace: true }) }), _jsx(Route, { path: "/admin/courses/:id", element: _jsx(Navigate, { to: "/admin/books", replace: true }) }), _jsx(Route, { path: "/admin/users", element: _jsx(AdminUsersPage, {}) }), _jsx(Route, { path: "/admin/permissions", element: _jsx(AdminPermissionsPage, {}) }), _jsx(Route, { path: "/admin/qr-codes", element: _jsx(AdminQRCodesPage, {}) }), _jsx(Route, { path: "/admin/activity-logs", element: _jsx(AdminActivityLogsPage, {}) }), _jsx(Route, { path: "/admin/lessons/:id/edit", element: _jsx(LessonEditPage, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoute, { allowedRoles: ['EDITOR'], children: _jsx(PortalLayout, {}) }), children: [_jsx(Route, { path: "/editor", element: _jsx(EditorDashboardPage, {}) }), _jsx(Route, { path: "/editor/lessons/:id/edit", element: _jsx(LessonEditPage, {}) })] }), _jsx(Route, { element: _jsx(ProtectedRoute, { allowedRoles: ['STUDENT'], children: _jsx(PortalLayout, {}) }), children: _jsx(Route, { path: "/student", element: _jsx(StudentDashboardPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(RootRedirect, {}) })] }) }) }) }));
};
export default App;
