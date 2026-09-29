import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { portalApi } from '../services/supabase';
import { CollegeEvent, Registration } from '../types';
import { useAuth } from '../context/AuthContext';
import { RegistrationModal } from '../components/events/RegistrationModal';
import { DigitalTicket } from '../components/events/DigitalTicket';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Share2,
  Ticket,
  Mail,
  Phone,
  Info,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { params, navigate } = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<CollegeEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);

  // Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const eventId = params.id;

  const loadEvent = async () => {
    if (!eventId) return;
    setIsLoading(true);
    try {
      const data = await portalApi.getEventById(eventId);
      setEvent(data);

      if (user?.id && data) {
        const myRegs = await portalApi.getMyRegistrations(user.id);
        const current = myRegs.find((r) => r.event_id === data.id && r.status === 'confirmed');
        setUserRegistration(current || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId, user?.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800">Event Not Found</h2>
        <p className="text-xs text-slate-500">The requested event could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-xs"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const seatsLeft = Math.max(0, event.max_participants - (event.registered_count || 0));
  const isFull = seatsLeft <= 0;
  const isFree = Number(event.registration_fee) === 0;
  const deadlineDate = new Date(event.registration_deadline);
  const isExpired = deadlineDate.getTime() < Date.now();

  const formattedEventDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Share toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden space-y-6">
        
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-blue-300 uppercase tracking-wider">
              {event.category?.name || 'Technical'}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">Department of {event.department}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="font-semibold text-emerald-400">
              {event.status === 'approved' ? '✓ Approved Official Event' : event.status.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {event.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Quick Details Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-blue-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Date</p>
              <p className="font-semibold text-white">{formattedEventDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-blue-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Time</p>
              <p className="font-semibold text-white">
                {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-blue-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase">Venue Location</p>
              <p className="font-semibold text-white">{event.venue?.name || 'Campus Venue'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Details on Left, Registration Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Event Body, Agenda Timeline, Rules */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Eligibility & Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-900" />
              <span>Event Overview &amp; Eligibility</span>
            </h2>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block mb-1">Target Eligibility:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {event.eligibility}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-900 block mb-1">Venue Description:</span>
                <p className="text-slate-600">
                  {event.venue?.description || 'Air-conditioned hall with high speed internet and laser projection systems.'} ({event.venue?.location})
                </p>
              </div>
            </div>
          </div>

          {/* Event Agenda & Schedule (from event_schedules table) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-900" />
              <span>Event Schedule &amp; Agenda</span>
            </h2>

            {event.schedules && event.schedules.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {event.schedules.map((item, idx) => (
                  <div key={item.id || idx} className="relative">
                    {/* Bullet marker */}
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-900 shadow-xs" />
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-900 block">
                        {item.schedule_time.slice(0, 5)}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Detailed timeline will be shared during inaugural session.</p>
            )}
          </div>

          {/* Rules & Regulations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-900" />
              <span>Rules &amp; Code of Conduct</span>
            </h2>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {event.rules || '1. Valid College ID card is mandatory for entry.\n2. Participants must be present 15 minutes before the start time for QR check-in.\n3. Digital participation certificate provided upon confirmed attendance.'}
            </div>
          </div>

        </div>

        {/* Right Column: Registration Card & Organizer Info */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Registration Status Action Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Registration Fee
              </span>
              <span className="font-extrabold text-xl text-slate-900">
                {isFree ? 'FREE' : `₹${event.registration_fee}`}
              </span>
            </div>

            {/* Capacity & Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Seats Available
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {seatsLeft} / {event.max_participants}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : 'bg-blue-900'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round(((event.registered_count || 0) / event.max_participants) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span>Registration Deadline: </span>
              <strong className="text-slate-800">
                {deadlineDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </div>

            {/* CTA Buttons */}
            {userRegistration ? (
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You are registered!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    ID: {userRegistration.registration_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View Digital QR Ticket</span>
                </button>
              </div>
            ) : isExpired ? (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-semibold cursor-not-allowed"
              >
                Registration Closed (Deadline Passed)
              </button>
            ) : isFull ? (
              <button
                disabled
                className="w-full py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-semibold cursor-not-allowed"
              >
                Housefull (Capacity Reached)
              </button>
            ) : (
              <button
                onClick={() => setShowRegModal(true)}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Register For Event
              </button>
            )}

            <p className="text-[10px] text-center text-slate-400">
              Immediate ticket generation with QR code upon registration.
            </p>

          </div>

          {/* Organizer Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Event Coordinator &amp; Host
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold text-sm flex items-center justify-center">
                {event.organizer?.name?.charAt(0) || 'F'}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">{event.organizer?.name || 'Department Faculty Coordinator'}</p>
                <p className="text-[11px] text-slate-500">{event.organizer?.department || event.department} Department</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{event.organizer?.email || 'events.cse@egspec.org'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>E.G.S. Pillay Engineering College, Nagapattinam</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <RegistrationModal
          event={event}
          onClose={() => setShowRegModal(false)}
          onSuccess={(reg) => {
            setShowRegModal(false);
            setUserRegistration(reg);
            setShowTicketModal(true);
            loadEvent();
          }}
        />
      )}

      {/* Digital Ticket Modal */}
      {showTicketModal && userRegistration && (
        <DigitalTicket
          registration={{ ...userRegistration, event }}
          onClose={() => setShowTicketModal(false)}
        />
      )}

    </div>
  );
};
