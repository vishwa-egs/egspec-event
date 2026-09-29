import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { CollegeEvent } from '../../types';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Shield,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const { navigate } = useRouter();

  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await portalApi.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await portalApi.changeEventStatus(id, 'approved');
      await fetchEvents();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter rejection feedback for the organizer:');
    if (reason === null) return;
    setActionId(id);
    try {
      await portalApi.changeEventStatus(id, 'rejected', reason || undefined);
      await fetchEvents();
    } finally {
      setActionId(null);
    }
  };

  const handleCancelEvent = async (id: string) => {
    const reason = window.prompt('Enter reason for event cancellation (this will alert all registered students):', 'Administrative reschedule');
    if (reason === null) return;
    setActionId(id);
    try {
      await portalApi.changeEventStatus(id, 'cancelled', reason);
      await fetchEvents();
    } finally {
      setActionId(null);
    }
  };

  const handleCompleteEvent = async (id: string) => {
    if (!window.confirm('Mark this event as completed? All attendees will be notified.')) return;
    setActionId(id);
    try {
      await portalApi.changeEventStatus(id, 'completed');
      await fetchEvents();
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this event and all associated registrations?')) return;
    setActionId(id);
    try {
      await portalApi.deleteEvent(id);
      await fetchEvents();
    } finally {
      setActionId(null);
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterStatus !== 'all' && ev.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.department.toLowerCase().includes(q) ||
        ev.category?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Manage All Events
            </h1>
            <p className="text-xs text-slate-500">
              Institutional review, status approval, and event lifecycle administration.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/organizer/events/create')}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
        >
          + Add New Event
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status} ({events.filter((e) => status === 'all' || e.status === status).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, dept, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No events found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category &amp; Dept</th>
                  <th className="py-3 px-4">Date &amp; Venue</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Dean Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80">
                    
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-xs truncate">
                        {ev.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Organizer: {ev.organizer?.name || 'Faculty Coordinator'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold text-blue-900 block">{ev.category?.name}</span>
                      <span className="text-[11px] text-slate-500">Dept of {ev.department}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-medium block">{ev.date}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[130px] block">{ev.venue?.name}</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {ev.registered_count || 0} / {ev.max_participants}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {ev.status === 'approved' && (
                        <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Approved
                        </span>
                      )}
                      {ev.status === 'pending' && (
                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pending
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

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {ev.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(ev.id)}
                              disabled={actionId === ev.id}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(ev.id)}
                              disabled={actionId === ev.id}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {ev.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleCancelEvent(ev.id)}
                              disabled={actionId === ev.id}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                              title="Cancel this event and notify all registered students"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCompleteEvent(ev.id)}
                              disabled={actionId === ev.id}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                              title="Mark concluded and notify attendees"
                            >
                              Conclude
                            </button>
                          </>
                        )}
                        {ev.status === 'cancelled' && (
                          <button
                            onClick={() => handleApprove(ev.id)}
                            disabled={actionId === ev.id}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                            title="Reactivate and approve event"
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/events/${ev.id}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          disabled={actionId === ev.id}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
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
