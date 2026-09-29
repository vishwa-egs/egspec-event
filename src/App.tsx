import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { NotificationToastContainer } from './components/common/NotificationToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { ExploreEventsPage } from './pages/ExploreEventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyEventsPage } from './pages/student/MyEventsPage';
import { MyTicketsPage } from './pages/student/MyTicketsPage';
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { CreateEventPage } from './pages/organizer/CreateEventPage';
import { AttendanceScannerPage } from './pages/organizer/AttendanceScannerPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminVenuesPage } from './pages/admin/AdminVenuesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AlertTriangle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { path } = useRouter();
  const { user } = useAuth();

  const renderRoute = () => {
    // Public routes
    if (path === '/' || path === '/home') return <HomePage />;
    if (path === '/events') return <ExploreEventsPage />;
    if (path.startsWith('/events/')) return <EventDetailPage />;
    if (path === '/login') return <LoginPage />;
    if (path === '/register') return <RegisterPage />;

    // Student routes
    if (path === '/dashboard') return <StudentDashboard />;
    if (path === '/my-events') return <MyEventsPage />;
    if (path === '/my-tickets') return <MyTicketsPage />;
    if (path === '/notifications') return <NotificationsPage />;
    if (path === '/profile') return <ProfilePage />;

    // Organizer routes
    if (path === '/organizer' || path === '/organizer/dashboard' || path === '/organizer/events') {
      return <OrganizerDashboard />;
    }
    if (path === '/organizer/events/create') return <CreateEventPage />;
    if (path === '/organizer/attendance') return <AttendanceScannerPage />;

    // Admin routes
    if (path === '/admin' || path === '/admin/dashboard') return <AdminDashboard />;
    if (path === '/admin/events') return <AdminEventsPage />;
    if (path === '/admin/users') return <AdminUsersPage />;
    if (path === '/admin/categories') return <AdminCategoriesPage />;
    if (path === '/admin/venues') return <AdminVenuesPage />;

    // 404 Fallback
    return (
      <div className="max-w-md mx-auto my-24 text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500">The requested URL &quot;{path}&quot; does not exist on this portal.</p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
        >
          Return Home
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-900 selection:text-white">
      <Navbar />
      <NotificationToastContainer />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
