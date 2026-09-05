import React, { useState } from 'react';
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
const PortalLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 relative">
        {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
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
  if (!user) return <Navigate to="/books" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'EDITOR') return <Navigate to="/editor" replace />;
  return <Navigate to="/books" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Public Digital Library Layout (NO LOGIN REQUIRED) */}
            <Route element={<PortalLayout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/books" element={<PublicBooksPage />} />
              <Route path="/books/:slug" element={<PublicBookDetailPage />} />
              <Route path="/books/:slug/lessons/:lessonNumber" element={<PublicLessonReaderPage />} />
              
              {/* Legacy course route redirects */}
              <Route path="/courses/:slug" element={<PublicBookDetailPage />} />
              <Route path="/courses/:courseSlug/lessons/:lessonSlug" element={<PublicLessonReaderPage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/admin/books/new" element={<AdminBooksPage />} />
              <Route path="/admin/books/:id/edit" element={<AdminBookDetailPage />} />
              <Route path="/admin/courses" element={<Navigate to="/admin/books" replace />} />
              <Route path="/admin/courses/:id" element={<Navigate to="/admin/books" replace />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
              <Route path="/admin/qr-codes" element={<AdminQRCodesPage />} />
              <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
              <Route path="/admin/lessons/:id/edit" element={<LessonEditPage />} />
            </Route>

            {/* Protected Editor Routes */}
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

            {/* Protected Student Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student" element={<StudentDashboardPage />} />
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
