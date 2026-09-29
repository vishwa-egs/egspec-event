import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { Registration, CollegeEvent, NotificationItem } from '../../types';
import { DigitalTicket } from '../../components/events/DigitalTicket';
import {
  Calendar,
  Ticket,
  CheckCircle2,
  Bell,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CollegeEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const [myRegs, allEvents, notifs] = await Promise.all([
          portalApi.getMyRegistrations(user.id),
          portalApi.getEvents({ status: 'approved' }),
          portalApi.getNotifications(user.id),
        ]);

        setRegistrations(myRegs);
        setUpcomingEvents(allEvents.slice(0, 3));
        setNotifications(notifs.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, [user?.id]);

  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');
  const attendedCount = registrations.filter((r) => r.status === 'attended').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">
            Student Dashboard
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs text-blue-200">
            {user?.department} · Register No: {user?.register_number} · {user?.year || '3rd Year'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/my-tickets')}
            className="px-4 py-2 bg-white text-blue-950 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-blue-900" />
            <span>My QR Tickets</span>
          </button>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-800 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors border border-blue-700/60"
          >
            Explore Events
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Registrations</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-slate-900">
            {activeRegistrations.length}
          </p>
          <p className="text-[11px] text-slate-500">Upcoming confirmed event admissions</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Events Attended</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-slate-900">
            {attendedCount}
          </p>
          <p className="text-[11px] text-slate-500">Verified attendance on record</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Unread Alerts</span>
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-slate-900">
            {notifications.filter((n) => !n.is_read).length}
          </p>
          <p className="text-[11px] text-slate-500">Campus updates and schedules</p>
        </div>

      </div>

      {/* Main Grid: My Active Tickets on Left, Recommendations & Notifications on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: My Active Registrations */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              My Active Event Tickets
            </h2>
            <button
              onClick={() => navigate('/my-events')}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All ({registrations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">No active registrations</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore upcoming workshops, symposiums and athletic meets to register and get your digital QR pass.
              </p>
              <button
                onClick={() => navigate('/events')}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
              >
                Browse Campus Events
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                        {reg.event?.category?.name || 'Event'}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {reg.registration_id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {reg.event?.title || 'Workshop'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {reg.event?.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {reg.event?.start_time.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{reg.event?.venue?.name || 'Campus'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>QR Ticket</span>
                    </button>
                    <button
                      onClick={() => navigate(`/events/${reg.event_id}`)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="View Event Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recommended Events & Notifications */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recommended Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recommended For You
            </h3>

            <div className="space-y-3">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/events/${ev.id}`)}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {ev.category?.name} · {ev.department}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {ev.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{ev.date}</span>
                    <span className="font-semibold text-blue-900">
                      {Number(ev.registration_fee) === 0 ? 'FREE' : `₹${ev.registration_fee}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Alerts
              </h3>
              <button
                onClick={() => navigate('/notifications')}
                className="text-[11px] text-blue-900 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                    notif.is_read
                      ? 'border-slate-100 bg-white text-slate-600'
                      : 'border-blue-100 bg-blue-50/50 text-slate-800 font-medium'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-xs">{notif.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <DigitalTicket
          registration={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

    </div>
  );
};
