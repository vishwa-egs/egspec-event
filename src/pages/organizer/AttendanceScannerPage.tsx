import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { CollegeEvent, Attendance, QRVerificationResult } from '../../types';
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Printer,
  Download,
  Calendar,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

export const AttendanceScannerPage: React.FC = () => {
  const { searchParams } = useRouter();
  const initialEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const [ticketInput, setTicketInput] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<QRVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState<boolean>(false);

  // Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const evs = await portalApi.getEvents();
        setEvents(evs);
        if (!selectedEventId && evs.length > 0) {
          setSelectedEventId(evs[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  // Load attendance list whenever selected event changes
  const loadAttendance = async (eventId: string) => {
    if (!eventId) return;
    setIsLoadingAttendance(true);
    try {
      const records = await portalApi.getAttendanceForEvent(eventId);
      setAttendanceList(records);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadAttendance(selectedEventId);
    }
  }, [selectedEventId]);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await portalApi.verifyQRTicket(ticketInput.trim(), selectedEventId || undefined);
      setVerificationResult(res);

      if (res.valid && selectedEventId) {
        await loadAttendance(selectedEventId);
        setTicketInput('');
      }
    } catch (err) {
      setVerificationResult({
        valid: false,
        message: 'Network or database error during verification.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportCSV = () => {
    if (attendanceList.length === 0) return;
    const header = ['Register Number', 'Student Name', 'Department', 'Check-in Time', 'Status'];
    const rows = attendanceList.map((a) => [
      a.student?.register_number || '',
      `"${a.student?.name || ''}"`,
      a.student?.department || '',
      new Date(a.check_in_time).toLocaleString(),
      a.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance-${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              QR Ticket Scanner &amp; Attendance Verifier
            </h1>
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
              Live Check-in
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scan attendee QR code or enter Registration ID (e.g. EVT-2026-000123) for instant admission verification.
          </p>
        </div>

        {/* Event Selection Dropdown */}
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Active Event For Check-in
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Scanner Input on Left, Verified Attendance List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: QR Scan Simulator & Result Card */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-amber-600" />
                <span>Verification Terminal</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">STATUS: READY</span>
            </div>

            <form onSubmit={handleVerifyTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scan QR / Enter Registration ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. EVT-2026-000123 or paste QR JSON"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    className="w-full text-xs font-mono p-3 pl-3 pr-20 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? 'Checking...' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons for testing demo IDs */}
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1">Quick Sample Registration IDs:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setTicketInput('EVT-2026-000123')}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                  >
                    EVT-2026-000123 (Vishwa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketInput('EVT-2026-000125')}
                    className="text-[11px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                  >
                    EVT-2026-000125 (Ananya)
                  </button>
                </div>
              </div>
            </form>

            {/* Verification Result Display Box */}
            {verificationResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                  verificationResult.valid
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-red-50/80 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm leading-snug">
                      {verificationResult.message}
                    </h3>
                    {verificationResult.checkInTime && (
                      <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                        Recorded: {new Date(verificationResult.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                {verificationResult.student && (
                  <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-medium block">Student</span>
                      <span className="font-bold">{verificationResult.student.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-medium block">Register No</span>
                      <span className="font-mono font-bold">{verificationResult.student.register_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-medium block">Department</span>
                      <span>{verificationResult.student.department} · {verificationResult.student.year || '3rd Year'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 font-medium block">Registration ID</span>
                      <span className="font-mono">{verificationResult.registration?.registration_id}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Event Summary Snapshot */}
            {activeEvent && (
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Event Selected
                </span>
                <p className="font-bold text-slate-800">{activeEvent.title}</p>
                <div className="flex items-center gap-3 text-[11px]">
                  <span>{activeEvent.date}</span>
                  <span>·</span>
                  <span>{activeEvent.venue?.name}</span>
                  <span>·</span>
                  <span>Max: {activeEvent.max_participants}</span>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Attendance Records & Export */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Checked-In Attendees
                  </h2>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {attendanceList.length} Present
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time admissions recorded via QR code verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={attendanceList.length === 0}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {isLoadingAttendance ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading attendance data...</div>
            ) : attendanceList.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-xs font-bold text-slate-700">No attendance check-ins recorded yet</h3>
                <p className="text-xs text-slate-400">Scan QR codes or enter registration IDs on the left panel.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Register No</th>
                      <th className="py-2.5 px-4">Student</th>
                      <th className="py-2.5 px-4">Dept</th>
                      <th className="py-2.5 px-4">Check-in Time</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                          {item.student?.register_number || 'REG-XXX'}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {item.student?.name || 'Student'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                          {item.student?.department || 'CSE'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(item.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
