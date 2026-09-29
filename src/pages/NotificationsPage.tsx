import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useRouter } from '../context/RouterContext';
import { portalApi } from '../services/supabase';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCheck,
  Send,
  Calendar,
  Shield,
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { navigate } = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    simulateTestAlert,
    fetchNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'registration' | 'event' | 'system'>('all');

  // Broadcast state for admin/organizer
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'student' | 'organizer'>('all');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    await portalApi.sendBroadcastNotification(
      broadcastTitle.trim(),
      broadcastMessage.trim(),
      'announcement',
      broadcastTarget
    );

    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
    await fetchNotifications();
  };

  const getNotifIcon = (item: NotificationItem) => {
    const isCancelled =
      item.metadata?.status === 'cancelled' ||
      item.title.toLowerCase().includes('cancelled');
    const isApproved =
      item.metadata?.status === 'approved' ||
      item.title.toLowerCase().includes('approved');

    if (isCancelled) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    if (item.type === 'registration') {
      return <Ticket className="w-4 h-4 text-emerald-600" />;
    }
    if (isApproved) {
      return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
    }
    if (item.type === 'event') {
      return <Calendar className="w-4 h-4 text-indigo-600" />;
    }
    return <Bell className="w-4 h-4 text-amber-600" />;
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.is_read;
    if (activeTab === 'registration') return item.type === 'registration';
    if (activeTab === 'event') return item.type === 'event';
    if (activeTab === 'system') return item.type === 'system' || item.type === 'announcement';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Notification Center &amp; Alerts</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant alerts for event status updates, registration confirmations, and campus schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? 'Chime sound is active' : 'Chime sound is muted'}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs font-semibold text-slate-600 hover:text-red-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Simulation & Test Panel */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Live Alert Testing Playground
            </h3>
          </div>
          <span className="text-[10px] text-blue-200 font-mono">REAL-TIME SIMULATOR</span>
        </div>
        <p className="text-xs text-slate-200">
          Simulate instantaneous notifications and floating alert banners for registration confirmations and event status changes:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={() => simulateTestAlert('registration_confirmed')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Registration Confirmed</span>
          </button>
          <button
            type="button"
            onClick={() => simulateTestAlert('event_approved')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="truncate">Event Approved</span>
          </button>
          <button
            type="button"
            onClick={() => simulateTestAlert('event_cancelled')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="truncate">Event Cancelled</span>
          </button>
          <button
            type="button"
            onClick={() => simulateTestAlert('event_completed')}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-left text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="truncate">Event Concluded</span>
          </button>
        </div>
      </div>

      {/* Broadcast Form (Only visible to Admin or Organizer) */}
      {(role === 'admin' || role === 'organizer') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-900" />
              <span>Broadcast Official Campus Announcement</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">FACULTY / ADMIN DISPATCH</span>
          </div>

          {broadcastSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Announcement dispatched successfully to all user inboxes!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Announcement title e.g. Important Symposium Schedule Update..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="all">Send to All Users</option>
                  <option value="student">Students Only</option>
                  <option value="organizer">Faculty Organizers Only</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                required
                placeholder="Important event notice, reschedule announcement, venue changes, or instructions..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Broadcast</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'unread'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('registration')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'registration'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Registrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('event')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'event'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Event Updates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'system'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Announcements
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700">Inbox is empty</h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'unread'
                ? 'All caught up! No unread notifications.'
                : 'No alerts in this category.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start gap-3.5 transition-colors group ${
                item.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/80 font-medium'
              }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                {getNotifIcon(item)}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    onClick={() => {
                      if (!item.is_read) markAsRead(item.id);
                      if (item.link) navigate(item.link);
                    }}
                    className={`text-xs cursor-pointer hover:text-blue-900 transition-colors ${
                      item.is_read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.message}
                </p>

                {/* Metadata & Direct CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {item.link && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!item.is_read) markAsRead(item.id);
                        navigate(item.link!);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors"
                    >
                      <span>{item.action_label || 'View Details'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}

                  {item.metadata?.registrationId && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      ID: {item.metadata.registrationId}
                    </span>
                  )}

                  {item.metadata?.status && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Status: {item.metadata.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!item.is_read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    title="Mark as read"
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  title="Delete"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 rounded transition-opacity"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
