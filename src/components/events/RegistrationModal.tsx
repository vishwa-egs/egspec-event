import React, { useState } from 'react';
import { CollegeEvent, Registration, PaymentTransaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { portalApi } from '../../services/supabase';
import {
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  Ticket,
  AlertCircle,
  CreditCard,
  Receipt,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { PaymentGatewayModal } from '../payments/PaymentGatewayModal';
import { PaymentReceiptModal } from '../payments/PaymentReceiptModal';

interface RegistrationModalProps {
  event: CollegeEvent;
  onClose: () => void;
  onSuccess: (reg: Registration) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRegistration, setSuccessRegistration] = useState<Registration | null>(null);
  const [lastPayment, setLastPayment] = useState<PaymentTransaction | null>(null);

  // Modals
  const [showGateway, setShowGateway] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const fee = Number(event.registration_fee) || 0;
  const isPaidEvent = fee > 0;

  const handleStartRegistration = () => {
    if (!user) {
      setError('Please sign in or select a demo student role first.');
      return;
    }
    setError(null);

    if (isPaidEvent) {
      // Open EGSPEC Payment Gateway
      setShowGateway(true);
    } else {
      // Direct free registration
      handleFreeRegistration();
    }
  };

  const handleFreeRegistration = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await portalApi.registerForEvent(event.id, user.id);
      if (!res.success || !res.registration) {
        setError(res.error || 'Failed to complete registration.');
        return;
      }

      setSuccessRegistration(res.registration);
      onSuccess(res.registration);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (result: {
    transactionRef: string;
    paymentMethod: string;
    amount: number;
    payment: PaymentTransaction;
  }) => {
    if (!user) return;
    setShowGateway(false);
    setIsSubmitting(true);
    setLastPayment(result.payment);

    try {
      const res = await portalApi.registerForEvent(event.id, user.id, {
        amount: result.amount,
        payment_method: result.paymentMethod,
        transaction_ref: result.transactionRef,
      });

      if (!res.success || !res.registration) {
        setError(res.error || 'Registration failed after payment. Please contact admin with your transaction ref: ' + result.transactionRef);
        return;
      }

      setSuccessRegistration(res.registration);
      onSuccess(res.registration);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not finalize registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Event Registration</h3>
              <p className="text-xs text-slate-500">E.G.S. Pillay Engineering College</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            
            {successRegistration ? (
              /* Success State */
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Registration Successful!</h4>
                  <p className="text-xs text-slate-500">
                    Your seat for <span className="font-semibold text-slate-800">{event.title}</span> has been confirmed.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Registration ID
                    </span>
                    <span className="font-mono text-base font-bold text-blue-900">
                      {successRegistration.registration_id}
                    </span>
                  </div>

                  {successRegistration.transaction_ref && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs px-2">
                      <span className="text-slate-500">Transaction Ref:</span>
                      <span className="font-mono font-bold text-emerald-700">{successRegistration.transaction_ref}</span>
                    </div>
                  )}

                  {successRegistration.amount_paid !== undefined && successRegistration.amount_paid > 0 && (
                    <div className="flex items-center justify-between text-xs px-2">
                      <span className="text-slate-500">Fee Paid:</span>
                      <span className="font-mono font-bold text-slate-900">₹{successRegistration.amount_paid.toFixed(2)} ({successRegistration.payment_method || 'Online'})</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  A digital ticket with your scannable admission QR code is generated. You can view, download, or show it at the venue.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  {isPaidEvent && (
                    <button
                      type="button"
                      onClick={() => setShowReceipt(true)}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <Receipt className="w-4 h-4" />
                      View Receipt
                    </button>
                  )}
                  <button
                    onClick={() => onSuccess(successRegistration)}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
                  >
                    <Ticket className="w-4 h-4" />
                    View Ticket
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Form / Confirmation State */
              <>
                {/* Event Mini Card */}
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                      {event.category?.name || 'Technical'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                      {isPaidEvent ? `Fee: ₹${fee}` : 'FREE ADMISSION'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-900" />
                      {formattedDate} · {event.start_time.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                      <span className="truncate">{event.venue?.name || 'Campus'}</span>
                    </span>
                  </div>
                </div>

                {/* Student Credentials Summary */}
                {user ? (
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Participant Information
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Full Name</span>
                        <span className="font-semibold text-slate-800">{user.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Register Number</span>
                        <span className="font-mono font-semibold text-slate-800">{user.register_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Department &amp; Year</span>
                        <span className="font-semibold text-slate-800">{user.department} · {user.year || '3rd Year'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Email &amp; Contact</span>
                        <span className="font-semibold text-slate-800 truncate block">{user.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>Please sign in with your student credentials or use the role switcher at top.</span>
                  </div>
                )}

                {/* Pricing & Terms */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Registration Fee</span>
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {isPaidEvent ? `₹${fee.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>
                  {isPaidEvent && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        EGSPEC Payment Gateway (UPI / Cards / NetBanking / Campus Wallet)
                      </span>
                      <span className="text-emerald-700 font-semibold">Zero Surcharge</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleStartRegistration}
                    disabled={isSubmitting || !user}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Processing...'
                    ) : isPaidEvent ? (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay ₹{fee.toFixed(2)} &amp; Register</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      'Confirm Free Registration'
                    )}
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showGateway && user && (
        <PaymentGatewayModal
          event={event}
          amount={fee}
          student={user}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowGateway(false)}
        />
      )}

      {/* Official Payment Receipt Modal */}
      {showReceipt && successRegistration && user && (
        <PaymentReceiptModal
          registration={successRegistration}
          event={event}
          student={user}
          payment={lastPayment}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </>
  );
};
