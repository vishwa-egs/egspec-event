import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { NotificationCenter } from './NotificationCenter';
import {
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Calendar,
  Ticket,
  Shield,
  Layers,
  PlusCircle,
  ScanLine,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, signOut, switchDemoRole } = useAuth();
  const { path, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnread = async () => {
    if (user?.id) {
      try {
        const notifs = await portalApi.getNotifications(user.id);
        const count = notifs.filter((n) => !n.is_read).length;
        setUnreadCount(count);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchUnread();
    const handleUpdate = () => fetchUnread();
    window.addEventListener('egspec_data_update', handleUpdate);
    return () => window.removeEventListener('egspec_data_update', handleUpdate);
  }, [user?.id]);

  // Determine Nav links according to role
  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Explore Events', path: '/events' },
        { label: 'Categories', path: '/events?section=categories' },
        { label: 'Venues', path: '/events?section=venues' },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard' },
        { label: 'Approvals', path: '/admin/events' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Categories', path: '/admin/categories' },
        { label: 'Venues', path: '/admin/venues' },
      ];
    }

    if (role === 'organizer') {
      return [
        { label: 'Dashboard', path: '/organizer/dashboard' },
        { label: 'My Events', path: '/organizer/events' },
        { label: '+ Create Event', path: '/organizer/events/create' },
        { label: 'Attendance', path: '/organizer/attendance' },
        { label: 'Explore Portal', path: '/events' },
      ];
    }

    // Student default
    return [
      { label: 'Explore Events', path: '/events' },
      { label: 'My Events', path: '/my-events' },
      { label: 'My Tickets', path: '/my-tickets' },
      { label: 'Dashboard', path: '/dashboard' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Demo Role Switcher Toolbar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800 flex items-center justify-between no-print">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-slate-400 font-medium whitespace-nowrap">Active Role:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => switchDemoRole('student')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                role === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Student (Vishwa)
            </button>
            <button
              onClick={() => switchDemoRole('organizer')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                role === 'organizer'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Organizer (Faculty)
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin (Dean Office)
            </button>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Firestore Connected
          </span>
          <span>E.G.S. Pillay Engineering College, Nagapattinam</span>
        </div>
      </div>

      {/* Main Top Bar Contract: 3-Zone Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Zone 1: Single element wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-extrabold text-base tracking-tight shadow-xs group-hover:bg-blue-800 transition-colors">
              EGS
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-900 transition-colors">
                E.G.S. Pillay Engineering College
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Event Management Portal
              </span>
            </div>
          </Link>

          {/* Zone 2: 4-6 Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((item) => {
              const active = path === item.path || (item.path !== '/' && path.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors py-1 ${
                    active
                      ? 'text-blue-900 font-semibold border-b-2 border-blue-900'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 Primary actions & Account */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Center */}
                <NotificationCenter />

                {/* Role Quick Action Button */}
                {role === 'organizer' && (
                  <button
                    onClick={() => navigate('/organizer/attendance')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    Scan QR
                  </button>
                )}

                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin/events')}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Review Pending
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20">
                        <div className="px-3 py-2 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {user.role} · {user.department}
                          </span>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              navigate('/profile');
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            My Profile
                          </button>

                          {role === 'student' && (
                            <>
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate('/my-events');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                My Registered Events
                              </button>
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate('/my-tickets');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Ticket className="w-3.5 h-3.5 text-slate-400" />
                                My Digital Tickets
                              </button>
                            </>
                          )}

                          {role === 'organizer' && (
                            <>
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate('/organizer/events/create');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
                                Create New Event
                              </button>
                              <button
                                onClick={() => {
                                  setUserDropdownOpen(false);
                                  navigate('/organizer/attendance');
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <ScanLine className="w-3.5 h-3.5 text-slate-400" />
                                QR Attendance Verifier
                              </button>
                            </>
                          )}

                          {role === 'admin' && (
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                navigate('/admin/dashboard');
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Layers className="w-3.5 h-3.5 text-slate-400" />
                              Admin Console
                            </button>
                          )}
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              signOut();
                              navigate('/login');
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors shadow-xs"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  path === item.path ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100"
                >
                  My Profile ({user.name})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
