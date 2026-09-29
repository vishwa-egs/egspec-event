import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { Registration } from '../../types';
import { DigitalTicket } from '../../components/events/DigitalTicket';
import { TicketQR } from '../../components/events/TicketQR';
import { PaymentReceiptModal } from '../../components/payments/PaymentReceiptModal';
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Receipt,
  CreditCard,
} from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [selectedReceiptTicket, setSelectedReceiptTicket] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await portalApi.getMyRegistrations(user.id);
        setRegistrations(data.filter((r) => r.status !== 'cancelled'));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Digital Event Tickets
            </h1>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Live QR Passes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official E-Passes for E.G.S. Pillay Engineering College events. Present QR code at the entrance counter.
          </p>
        </div>

        <button
          onClick={() => navigate('/events')}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
        >
          Explore More Events
        </button>
      </div>

      {/* Ticket Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Active Tickets</h3>
            <p className="text-xs text-slate-500">
              You do not have any active event passes right now. Register for an upcoming event to generate your digital QR pass.
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs"
          >
            Browse College Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => (
            <TicketWalletCard
              key={reg.id}
              registration={reg}
              onOpenModal={() => setSelectedTicket(reg)}
              onOpenReceipt={() => setSelectedReceiptTicket(reg)}
            />
          ))}
        </div>
      )}

      {/* Full Modal */}
      {selectedTicket && (
        <DigitalTicket
          registration={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}

      {/* Official Payment Receipt Modal */}
      {selectedReceiptTicket && selectedReceiptTicket.event && user && (
        <PaymentReceiptModal
          registration={selectedReceiptTicket}
          event={selectedReceiptTicket.event}
          student={user}
          onClose={() => setSelectedReceiptTicket(null)}
        />
      )}

    </div>
  );
};

const TicketWalletCard: React.FC<{
  registration: Registration;
  onOpenModal: () => void;
  onOpenReceipt: () => void;
}> = ({ registration, onOpenModal, onOpenReceipt }) => {
  const event = registration.event;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
      
      {/* College Header Strip */}
      <div className="bg-blue-950 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            EGS
          </div>
          <span className="text-xs font-bold tracking-tight">E.G.S. PILLAY ENGINEERING COLLEGE</span>
        </div>
        <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-blue-200">
          OFFICIAL PASS
        </span>
      </div>

      {/* Body Area */}
      <div className="p-5 flex flex-col sm:flex-row gap-5 items-center">
        
        {/* Scannable TicketQR Component */}
        <div className="shrink-0">
          <TicketQR
            registrationId={registration.registration_id}
            eventId={registration.event_id}
            studentId={registration.student_id}
            size={120}
            showActions={true}
            showLabel={true}
            subLabel="Click Enlarge at gate"
            className="w-full sm:w-auto"
          />
        </div>

        {/* Event & Student Details */}
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <div>
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {event?.category?.name || 'Technical'}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
              {event?.title}
            </h3>
          </div>

          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{event?.date} · {event?.start_time?.slice(0, 5)}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[200px]">{event?.venue?.name}</span>
            </div>
          </div>

          <div className="pt-1 text-[11px] text-slate-600">
            <span>Pass Holder: </span>
            <strong className="text-slate-800">{registration.student?.name}</strong>
            <span className="text-slate-400"> ({registration.student?.register_number})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Admission: {registration.status.toUpperCase()}</span>
            </div>
            {registration.payment_status === 'paid' && (
              <span className="inline-flex items-center gap-1 text-[10px] text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Fee Paid: ₹{registration.amount_paid ?? event?.registration_fee ?? 0}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Card Actions Footer */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
        {(registration.payment_status === 'paid' || (event?.registration_fee && event.registration_fee > 0)) && (
          <button
            onClick={onOpenReceipt}
            className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
            <span>Fee Receipt</span>
          </button>
        )}
        <button
          onClick={onOpenModal}
          className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Full Ticket / Print</span>
        </button>
      </div>

    </div>
  );
};
