import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';

import { ScrollToTop } from './components/common/ScrollToTop';

// Public Direct QR Access Pages & Auth
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

// Portal Layout with Navbar, Sidebar, and Footer
const PortalLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const showSidebar = Boolean(user && (user.role === 'ADMIN' || user.role === 'EDITOR'));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-stone-50">
      <Navbar onToggleSidebar={showSidebar ? () => setSidebarOpen(!sidebarOpen) : undefined} />
      <div className="flex flex-1 relative">
        {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};


// Root index & unauthenticated entry redirector
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'EDITOR') return <Navigate to="/editor" replace />;
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Main Entry Point: Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Direct QR Access & Protected Application Routes */}
            <Route element={<PortalLayout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/books" element={<RootRedirect />} />
              
              {/* Canonical Company-Based Routes for Books & Lessons */}
              <Route path="/:company/books/:slug" element={<PublicBookDetailPage />} />
              <Route path="/:company/books/:slug/lessons/:lessonNumber" element={<PublicLessonReaderPage />} />

              {/* Direct Legacy QR Code Access Paths for Backward Compatibility */}
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

            {/* Catch All */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
