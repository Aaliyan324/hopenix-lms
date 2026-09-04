import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminCourseDetailPage } from './pages/admin/AdminCourseDetailPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';
import { AdminQRCodesPage } from './pages/admin/AdminQRCodesPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';

import { EditorDashboardPage } from './pages/editor/EditorDashboardPage';
import { LessonEditPage } from './pages/editor/LessonEditPage';

import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { CoursePage } from './pages/student/CoursePage';
import { LessonViewerPage } from './pages/student/LessonViewerPage';

// Portal Layout with Navbar & Sidebar
const PortalLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'EDITOR') return <Navigate to="/editor" replace />;
  return <Navigate to="/student" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/courses" element={<AdminCoursesPage />} />
              <Route path="/admin/courses/:id" element={<AdminCourseDetailPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
              <Route path="/admin/qr-codes" element={<AdminQRCodesPage />} />
              <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
              <Route path="/admin/lessons/:id/edit" element={<LessonEditPage />} />
            </Route>

            {/* Editor Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['EDITOR']}>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/editor" element={<EditorDashboardPage />} />
              <Route path="/editor/lessons/:id/edit" element={<LessonEditPage />} />
            </Route>

            {/* Student Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student" element={<StudentDashboardPage />} />
              <Route path="/courses/:slug" element={<CoursePage />} />
              <Route path="/courses/:courseSlug/lessons/:lessonSlug" element={<LessonViewerPage />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
