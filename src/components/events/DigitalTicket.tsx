import React, { useRef, useState } from 'react';
import { Registration } from '../../types';
import { TicketQR } from './TicketQR';
import html2canvas from 'html2canvas';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  User,
  Receipt,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  Sparkles,
  Ticket
} from 'lucide-react';
import { PaymentReceiptModal } from '../payments/PaymentReceiptModal';

interface DigitalTicketProps {
  registration: Registration;
  onClose?: () => void;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ registration, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const event = registration.event;
  const student = registration.student;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPassImage = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imgData;
      downloadLink.download = `EGSPEC_EPass_${registration.registration_id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Error downloading E-Pass:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedDate = event
    ? new Date(event.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Upcoming Event';

  const isPaid = registration.payment_status === 'paid' || (event?.registration_fee && event.registration_fee > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Top Navigation & Controls Bar with Backward Button */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between no-print gap-2">
          {/* Prominent Backward / Back Button */}
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-600 shadow-xs cursor-pointer"
                title="Backward / Back to tickets"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Back</span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-300 ml-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official College E-Pass</span>
            </div>
          </div>

          {/* Quick Actions (Download, Print, Receipt, Close) */}
          <div className="flex items-center gap-2 shrink-0">
            {isPaid && event && student && (
              <button
                type="button"
                onClick={() => setShowReceipt(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800 rounded-lg transition-colors"
                title="View Official Fee Receipt"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Fee Receipt</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPassImage}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              title="Download E-Pass as high-res image"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Save E-Pass</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title="Print Pass / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between no-print animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Rectangular E-Pass image downloaded successfully to your device!</span>
            </div>
            <button
              onClick={() => setDownloadSuccess(false)}
              className="text-xs text-emerald-700 font-bold hover:text-emerald-900"
            >
              ×
            </button>
          </div>
        )}

        {/* RECTANGULAR E-PASS BODY (Printable & Capturable) */}
        <div
          ref={ticketRef}
          className="printable-receipt bg-white text-slate-900 flex flex-col md:flex-row relative overflow-hidden"
        >
          {/* Top Decorative Institutional Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-900" />

          {/* LEFT SECTION: MAIN ADMISSION PASS (~64% width on desktop) */}
          <div className="flex-1 p-6 sm:p-7 space-y-4 relative flex flex-col justify-between">
            {/* Header Branding */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-950 text-amber-300 border-2 border-amber-400 flex items-center justify-center font-black text-sm tracking-wider shadow-xs shrink-0">
                  EGS
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black tracking-tight text-blue-950 leading-tight uppercase font-serif">
                    E.G.S. PILLAY ENGINEERING COLLEGE
                  </h2>
                  <p className="text-[10px] font-bold text-amber-800 tracking-wide uppercase">
                    (AUTONOMOUS) · ACCREDITED BY NAAC WITH 'A++' GRADE
                  </p>
                  <p className="text-[9px] text-slate-500">
                    EVENT MANAGEMENT PORTAL · OFFICIAL E-PASS
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  CONFIRMED
                </span>
              </div>
            </div>

            {/* Event Category & Title */}
            <div className="space-y-1.5">
              <div>
                <span className="inline-block text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
                  {event?.category?.name || 'Competition'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                {event?.title || 'College Event & Championship'}
              </h3>
            </div>

            {/* Date, Time & Venue Horizontal Rectangular Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Date</p>
                  <p className="font-bold text-slate-800 text-xs">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Time</p>
                  <p className="font-bold text-slate-800 text-xs">
                    {event?.start_time ? event.start_time.slice(0, 5) : '10:00 AM'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-900 mt-0.5 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Venue</p>
                  <p className="font-bold text-slate-800 text-xs truncate" title={event?.venue?.name}>
                    {event?.venue?.name || 'Main Campus'}
                  </p>
                </div>
              </div>
            </div>

            {/* Participant Credentials Box */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Registered Participant
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {student?.name || 'Participant Name'}
                    </span>
                  </div>
                </div>

                {isPaid && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Fee Settled: ₹{registration.amount_paid ?? event?.registration_fee ?? 0}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/70">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Reg. No</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {student?.register_number || '820822104055'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Department</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {student?.department || 'CSE'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Year</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {student?.year || '3rd Year'}
                  </span>
                </div>
              </div>
            </div>

            {/* Institutional Authentic Footer Note */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-100">
              <span>E.G.S. Pillay Engineering College, Nagapattinam · Autonomous</span>
              <span className="font-mono text-slate-500">ID: {registration.registration_id}</span>
            </div>
          </div>

          {/* PERFORATION DIVIDER WITH AUTHENTIC TICKET NOTCHES */}
          <div className="relative flex items-center justify-center">
            {/* Desktop Vertical Perforated Line */}
            <div className="hidden md:block w-px h-full border-r-2 border-dashed border-slate-300 relative">
              {/* Top Notch Cutout */}
              <div className="absolute -top-3.5 -left-3 w-6 h-6 rounded-full bg-slate-950/80 border border-slate-300 print:hidden" />
              {/* Bottom Notch Cutout */}
              <div className="absolute -bottom-3.5 -left-3 w-6 h-6 rounded-full bg-slate-950/80 border border-slate-300 print:hidden" />
            </div>

            {/* Mobile Horizontal Perforated Line */}
            <div className="block md:hidden w-full h-px border-b-2 border-dashed border-slate-300 relative my-1">
              <div className="absolute -left-3.5 -top-3 w-6 h-6 rounded-full bg-slate-950/80 border border-slate-300 print:hidden" />
              <div className="absolute -right-3.5 -top-3 w-6 h-6 rounded-full bg-slate-950/80 border border-slate-300 print:hidden" />
            </div>
          </div>

          {/* RIGHT SECTION: SCAN ENTRY STUB (~36% width on desktop) */}
          <div className="w-full md:w-80 lg:w-88 bg-slate-50/90 p-6 flex flex-col items-center justify-between space-y-4 shrink-0 text-center">
            {/* Stub Header */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                Official Entry Stub
              </span>
              <span className="text-xs font-black text-blue-950 tracking-wider uppercase block">
                Scan to Admit
              </span>
            </div>

            {/* Center Scannable QR Code */}
            <div className="w-full flex flex-col items-center justify-center">
              <TicketQR
                registrationId={registration.registration_id}
                eventId={registration.event_id}
                studentId={registration.student_id}
                size={144}
                showActions={true}
                showLabel={true}
                subLabel="Present at venue entrance counter for attendance verification"
              />
            </div>

            {/* Admission Status & Barcode Simulation */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-200/80">
              <div className="inline-flex items-center justify-center gap-1.5 w-full py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Admission: CONFIRMED</span>
              </div>

              {/* Graphical Simulated Barcode */}
              <div className="flex items-center justify-center gap-1 py-1 opacity-70">
                <div className="w-1 h-6 bg-slate-800" />
                <div className="w-0.5 h-6 bg-slate-800" />
                <div className="w-1.5 h-6 bg-slate-800" />
                <div className="w-0.5 h-6 bg-slate-800" />
                <div className="w-2 h-6 bg-slate-800" />
                <div className="w-1 h-6 bg-slate-800" />
                <div className="w-0.5 h-6 bg-slate-800" />
                <div className="w-1.5 h-6 bg-slate-800" />
                <div className="w-2 h-6 bg-slate-800" />
                <div className="w-0.5 h-6 bg-slate-800" />
                <div className="w-1 h-6 bg-slate-800" />
                <div className="w-1.5 h-6 bg-slate-800" />
                <div className="w-0.5 h-6 bg-slate-800" />
              </div>
              <span className="font-mono text-[9px] text-slate-400 tracking-widest block">
                *SEC-VERIFIED-{registration.registration_id.slice(-6)}*
              </span>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BAR (With Backward Button) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between no-print gap-3">
          {/* Backward Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Tickets</span>
            </button>
          )}

          <div className="w-full sm:w-auto flex items-center justify-end gap-2">
            {isPaid && event && student && (
              <button
                type="button"
                onClick={() => setShowReceipt(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Fee Receipt</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPassImage}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isDownloading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download E-Pass (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Payment Receipt Modal */}
      {showReceipt && event && student && (
        <PaymentReceiptModal
          registration={registration}
          event={event}
          student={student}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
