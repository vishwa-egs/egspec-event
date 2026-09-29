import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { Registration } from '../../types';
import { DigitalTicket } from '../../components/events/DigitalTicket';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  AlertTriangle,
  ExternalLink,
  Ban,
  Search,
} from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'attended' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [cancellingReg, setCancellingReg] = useState<Registration | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchRegistrations = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await portalApi.getMyRegistrations(user.id);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [user?.id]);

  const handleConfirmCancel = async () => {
    if (!cancellingReg) return;
    setCancelLoading(true);
    try {
      await portalApi.cancelRegistration(cancellingReg.id);
      setCancellingReg(null);
      await fetchRegistrations();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = r.event?.title.toLowerCase().includes(q);
      const matchId = r.registration_id.toLowerCase().includes(q);
      const matchCat = r.event?.category?.name.toLowerCase().includes(q);
      return matchTitle || matchId || matchCat;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Registered Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your registrations, download admission tickets, and view attendance verification status.
          </p>
        </div>

        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs self-start md:self-auto"
        >
          Explore More Events
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Status Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'confirmed', 'attended', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status} ({registrations.filter((r) => status === 'all' || r.status === status).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

      </div>

      {/* Event Registrations List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Registrations Found</h3>
            <p className="text-xs text-slate-500">
              {filterStatus !== 'all'
                ? `No events with status "${filterStatus}".`
                : 'You have not registered for any events yet.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
          >
            Find College Events
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRegistrations.map((reg) => {
            const isConfirmed = reg.status === 'confirmed';
            const isAttended = reg.status === 'attended';
            const isCancelled = reg.status === 'cancelled';

            return (
              <div
                key={reg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Details Column */}
                <div className="space-y-2 flex-1">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {reg.event?.category?.name || 'General'}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {reg.registration_id}
                    </span>

                    {/* Status Badge */}
                    {isConfirmed && (
                      <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Confirmed
                      </span>
                    )}
                    {isAttended && (
                      <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        ✓ Attended
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[10px] font-bold uppercase text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Cancelled
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {reg.event?.title || 'Workshop'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {reg.event?.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {reg.event?.start_time.slice(0, 5)} - {reg.event?.end_time.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{reg.event?.venue?.name || 'Campus'}</span>
                    </span>
                  </div>

                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  
                  {/* View Ticket Button */}
                  {!isCancelled && (
                    <button
                      onClick={() => setSelectedTicket(reg)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Digital Pass</span>
                    </button>
                  )}

                  {/* View Details */}
                  <button
                    onClick={() => navigate(`/events/${reg.event_id}`)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    title="View Event Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {/* Cancel Registration Button (only if confirmed) */}
                  {isConfirmed && (
                    <button
                      onClick={() => setCancellingReg(reg)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                      title="Cancel Registration"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <DigitalTicket
          registration={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Cancel Event Registration?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel your registration for <strong className="text-slate-800">{cancellingReg.event?.title}</strong>? Your seat will be released for other students.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCancellingReg(null)}
                disabled={cancelLoading}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Keep Seat
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
