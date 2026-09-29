import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { CollegeEvent } from '../../types';
import {
  Calendar,
  Users,
  PlusCircle,
  ScanLine,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [myEvents, setMyEvents] = useState<CollegeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrganizerEvents = async () => {
    setIsLoading(true);
    try {
      // Fetch events managed by this organizer or all if faculty
      const all = await portalApi.getEvents();
      const filtered = user?.id ? all.filter((e) => e.organizer_id === user.id || user.role === 'admin') : all;
      setMyEvents(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, [user?.id]);

  const handleCancelEvent = async (id: string) => {
    const reason = window.prompt('Enter cancellation note for registered students:', 'Unavoidable schedule conflict');
    if (reason === null) return;
    setDeletingId(id);
    try {
      await portalApi.changeEventStatus(id, 'cancelled', reason);
      await fetchOrganizerEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCompleteEvent = async (id: string) => {
    if (!window.confirm('Mark this event as concluded? Registered attendees will be notified.')) return;
    setDeletingId(id);
    try {
      await portalApi.changeEventStatus(id, 'completed');
      await fetchOrganizerEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this event and all associated registrations?')) {
      return;
    }
    setDeletingId(id);
    try {
      await portalApi.deleteEvent(id);
      await fetchOrganizerEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalRegistrations = myEvents.reduce((acc, ev) => acc + (ev.registered_count || 0), 0);
  const pendingCount = myEvents.filter((e) => e.status === 'pending').length;
  const approvedCount = myEvents.filter((e) => e.status === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Faculty &amp; Staff Console
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Event Organizer Dashboard
          </h1>
          <p className="text-xs text-slate-300">
            {user?.name} · {user?.department} Department · Coordinator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/organizer/attendance')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ScanLine className="w-4 h-4 text-slate-950" />
            <span>QR Attendance Scanner</span>
          </button>
          <button
            onClick={() => navigate('/organizer/events/create')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Event</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-slate-900">
            {myEvents.length}
          </p>
          <p className="text-[11px] text-slate-500">Events under your coordination</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Registrations</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-slate-900">
            {totalRegistrations}
          </p>
          <p className="text-[11px] text-slate-500">Students registered across events</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved &amp; Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-emerald-700">
            {approvedCount}
          </p>
          <p className="text-[11px] text-slate-500">Open for student registrations</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Dean Approval</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-amber-600">
            {pendingCount}
          </p>
          <p className="text-[11px] text-slate-500">Awaiting Dean Office review</p>
        </div>

      </div>

      {/* Events Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
        
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Coordinated Events
            </h2>
            <p className="text-xs text-slate-500">
              Manage participant limits, view registrations, and verify QR codes.
            </p>
          </div>
          <button
            onClick={() => navigate('/organizer/events/create')}
            className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Event Proposal</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : myEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No events found</h3>
            <p className="text-xs text-slate-400">Click &quot;New Event Proposal&quot; to publish your first college event.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Date &amp; Venue</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Event Title & Category */}
                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                        {ev.category?.name || 'Technical'} · Dept: {ev.department}
                      </span>
                      <p className="font-bold text-slate-900 text-xs truncate mt-0.5">
                        {ev.title}
                      </p>
                    </td>

                    {/* Date & Venue */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{ev.date}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{ev.venue?.name}</p>
                    </td>

                    {/* Capacity Progress */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-800">
                          {ev.registered_count || 0} / {ev.max_participants}
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round(((ev.registered_count || 0) / ev.max_participants) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {Number(ev.registration_fee) === 0 ? 'FREE' : `₹${ev.registration_fee}`}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {ev.status === 'approved' && (
                        <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Approved
                        </span>
                      )}
                      {ev.status === 'pending' && (
                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending Review
                        </span>
                      )}
                      {ev.status === 'rejected' && (
                        <span className="text-[10px] font-bold uppercase text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Rejected
                        </span>
                      )}
                      {ev.status === 'cancelled' && (
                        <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          Cancelled
                        </span>
                      )}
                      {ev.status === 'completed' && (
                        <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Concluded
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/organizer/attendance?eventId=${ev.id}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors flex items-center gap-1"
                          title="Scan QR Tickets"
                        >
                          <ScanLine className="w-3 h-3" />
                          <span>Check-in</span>
                        </button>
                        {ev.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleCancelEvent(ev.id)}
                              disabled={deletingId === ev.id}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                              title="Cancel event and notify registered participants"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCompleteEvent(ev.id)}
                              disabled={deletingId === ev.id}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                              title="Mark event completed"
                            >
                              Conclude
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/events/${ev.id}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="View Public Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          disabled={deletingId === ev.id}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
