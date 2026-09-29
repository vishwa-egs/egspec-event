import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { CollegeEvent, PaymentTransaction } from '../../types';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  BarChart3,
  TrendingUp,
  MapPin,
  Building,
  CreditCard,
  Receipt,
  IndianRupee,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const CHART_COLORS = ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B', '#EF4444'];

export const AdminDashboard: React.FC = () => {
  const { navigate } = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [pendingEvents, setPendingEvents] = useState<CollegeEvent[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [st, events, txns] = await Promise.all([
        portalApi.getAdminStats(),
        portalApi.getEvents({ status: 'pending' }),
        portalApi.getPayments(),
      ]);
      setStats(st);
      setPendingEvents(events);
      setPayments(txns);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await portalApi.approveEvent(id);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Enter reason for event rejection (optional):');
    setProcessingId(id);
    try {
      await portalApi.rejectEvent(id, reason || undefined);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Institutional Administration
            </span>
            <span className="text-xs bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
              Dean Office Portal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Campus Event Administration
          </h1>
          <p className="text-xs text-slate-300">
            E.G.S. Pillay Engineering College, Nagapattinam · System Overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/events')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Shield className="w-4 h-4" />
            <span>Manage All Events</span>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition-colors border border-slate-700"
          >
            User Directory
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Section 34) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Total Students
          </span>
          <p className="font-mono text-2xl font-extrabold text-slate-900">
            {stats?.totalStudents || 1200}
          </p>
          <span className="text-[10px] text-slate-400">Active campus accounts</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Organizers &amp; Staff
          </span>
          <p className="font-mono text-2xl font-extrabold text-slate-900">
            {stats?.totalOrganizers || 45}
          </p>
          <span className="text-[10px] text-slate-400">Department faculty</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Total Events
          </span>
          <p className="font-mono text-2xl font-extrabold text-slate-900">
            {stats?.totalEvents || 0}
          </p>
          <span className="text-[10px] text-slate-400">Technical &amp; cultural</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">
            Pending Approval
          </span>
          <p className="font-mono text-2xl font-extrabold text-amber-600">
            {pendingEvents.length}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Requires Dean Action</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Total Registrations
          </span>
          <p className="font-mono text-2xl font-extrabold text-blue-900">
            {stats?.totalRegistrations || 0}
          </p>
          <span className="text-[10px] text-slate-400">Seats allocated</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block">
            Treasury Revenue
          </span>
          <p className="font-mono text-2xl font-extrabold text-emerald-700">
            ₹{payments.reduce((acc, p) => acc + (p.status === 'success' ? Number(p.amount) || 0 : 0), 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">
            {payments.length} gateway transactions
          </span>
        </div>

      </div>

      {/* Pending Event Approvals Priority Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Event Approval Queue
            </h2>
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {pendingEvents.length} Pending
            </span>
          </div>
          <span className="text-xs text-slate-400">Dean Office verification workflow</span>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700">Approval Queue is Clear</h3>
            <p className="text-xs text-slate-400">All submitted college events have been reviewed and published.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                      {ev.category?.name || 'Technical'}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-700">Dept: {ev.department}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">Submitted by {ev.organizer?.name || 'Faculty'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {ev.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ev.date} · {ev.start_time.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ev.venue?.name} (Cap: {ev.max_participants})
                    </span>
                    <span className="font-mono font-medium text-slate-700">
                      Fee: {Number(ev.registration_fee) === 0 ? 'FREE' : `₹${ev.registration_fee}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/events/${ev.id}`)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleReject(ev.id)}
                    disabled={processingId === ev.id}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(ev.id)}
                    disabled={processingId === ev.id}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  >
                    Approve &amp; Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Payment Gateway Ledger & Campus Treasury */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Payment Gateway Ledger &amp; Treasury
              </h2>
              <p className="text-xs text-slate-500">
                Live UPI, RuPay/Cards, NetBanking, and Campus Wallet settlements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
              Total: ₹{payments.reduce((acc, p) => acc + (p.status === 'success' ? Number(p.amount) || 0 : 0), 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">No payment transactions recorded yet.</p>
            <p className="text-slate-400 mt-0.5">When students pay registration fees for symposiums or workshops, records will appear here live.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.slice(0, 10).map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {txn.transaction_ref}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(txn.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {txn.student_name || 'Student Candidate'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {txn.payment_method_detail || txn.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics & Charts Grid (Section 34) */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Department Participation Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Department Participation
                </h3>
                <p className="text-[11px] text-slate-400">Total student registrations by engineering branch</p>
              </div>
              <BarChart3 className="w-4 h-4 text-blue-900" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentParticipation}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#60A5FA' }}
                  />
                  <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Registrations Trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Monthly Registration Trend
                </h3>
                <p className="text-[11px] text-slate-400">Growth trajectory over past 5 academic months</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#34D399' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Events by Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Events Distribution by Category
                </h3>
                <p className="text-[11px] text-slate-400">Total approved and scheduled campus programs</p>
              </div>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {stats.categoryChartData.map((item: any, idx: number) => (
                <div key={item.name} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block truncate">
                    {item.name}
                  </span>
                  <span className="font-mono text-xl font-extrabold text-blue-950 mt-1 block">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
