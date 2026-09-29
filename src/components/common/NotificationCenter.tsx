import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { NotificationItem } from '../../types';
import {
  Bell,
  BellOff,
  CheckCheck,
  Ticket,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Info,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    toggleSound,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    simulateTestAlert,
  } = useNotifications();

  const { user, role } = useAuth();
  const { navigate } = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'registration' | 'event' | 'system'>('all');
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter notifications
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.is_read;
    if (activeTab === 'registration') return item.type === 'registration';
    if (activeTab === 'event') return item.type === 'event';
    if (activeTab === 'system') return item.type === 'system' || item.type === 'announcement';
    return true;
  });

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (item: NotificationItem) => {
    const isCancelled =
      item.metadata?.status === 'cancelled' ||
      item.title.toLowerCase().includes('cancelled');
    const isApproved =
      item.metadata?.status === 'approved' ||
      item.title.toLowerCase().includes('approved');

    if (isCancelled) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }

    if (item.type === 'registration') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Ticket className="w-4 h-4" />
        </div>
      );
    }

    if (isApproved) {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    if (item.type === 'event') {
      return (
        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
      );
    }

    return (
      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          isOpen
            ? 'bg-blue-100 text-blue-900 ring-2 ring-blue-500/30'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        aria-label="Open notifications center"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold tabular-nums shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 pointer-events-none" />
            <span className="relative z-10">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Popover Notification Center */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 md:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight text-white">
                    Notification Center
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  {user ? `${user.name} (${role})` : 'E.G.S. Event Alerts'}
                </p>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSound}
                title={soundEnabled ? 'Chime sound is ON (click to mute)' : 'Chime sound is OFF (click to unmute)'}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label="Toggle chime sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="Close notification center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1 overflow-x-auto text-[11px] font-medium text-slate-600 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                  : 'hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'unread'
                  ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                  : 'hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('registration')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'registration'
                  ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                  : 'hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              Registrations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('event')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'event'
                  ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                  : 'hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              Events
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <BellOff className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">No notifications here</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {activeTab === 'unread'
                    ? 'Great job! You have caught up with all your event alerts.'
                    : 'You have no alerts in this category at the moment.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors flex items-start gap-3 group relative ${
                    item.is_read
                      ? 'bg-white hover:bg-slate-50/80'
                      : 'bg-blue-50/50 hover:bg-blue-50/80'
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(item)}

                  {/* Main content */}
                  <div
                    onClick={() => handleItemClick(item)}
                    className="flex-1 min-w-0 cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <h4
                        className={`text-xs leading-snug truncate ${
                          item.is_read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
                        {getRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>

                    {/* Metadata badge or action link */}
                    <div className="pt-1 flex items-center gap-2">
                      {item.link && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:text-blue-700">
                          <span>{item.action_label || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}

                      {item.metadata?.registrationId && (
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                          {item.metadata.registrationId}
                        </span>
                      )}

                      {item.metadata?.status && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                          {item.metadata.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right side individual actions */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {!item.is_read && (
                      <span
                        title="Unread"
                        className="w-2 h-2 rounded-full bg-blue-600 my-1"
                      />
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      title="Delete notification"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Simulation / Testing Helper Bar */}
          <div className="border-t border-slate-200 bg-slate-50/90 p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate Real-time Alerts</span>
              </button>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-slate-400 hover:text-red-600 font-medium"
                >
                  Clear inbox
                </button>
              )}
            </div>

            {showSimulateMenu && (
              <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => simulateTestAlert('registration_confirmed')}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-left text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1"
                >
                  <Ticket className="w-3 h-3 text-emerald-600" />
                  <span>Registration Confirmed</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateTestAlert('event_approved')}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-left text-[10px] font-semibold text-blue-800 hover:bg-blue-50 transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>Event Approved</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateTestAlert('event_cancelled')}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-left text-[10px] font-semibold text-red-800 hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>Event Cancelled</span>
                </button>
                <button
                  type="button"
                  onClick={() => simulateTestAlert('event_completed')}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-left text-[10px] font-semibold text-purple-800 hover:bg-purple-50 transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-purple-600" />
                  <span>Event Concluded</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Alert System Active</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>Full Inbox</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
