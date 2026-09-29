import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { portalApi } from '../services/supabase';
import { NotificationItem, CollegeEvent, Registration, EventStatus } from '../types';

export interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: NotificationItem['type'];
  created_at: string;
  link?: string;
  action_label?: string;
  metadata?: NotificationItem['metadata'];
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  soundEnabled: boolean;
  toasts: ToastAlert[];
  toggleSound: () => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  notifyEventStatusChange: (event: CollegeEvent, newStatus: EventStatus, note?: string) => Promise<void>;
  notifyRegistrationConfirmed: (reg: Registration, ev: CollegeEvent) => Promise<void>;
  dismissToast: (id: string) => void;
  simulateTestAlert: (scenario: 'registration_confirmed' | 'event_approved' | 'event_cancelled' | 'event_completed') => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio chime generator
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    // Pleasant two-tone interval (D5 to A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // Audio policy suppression
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('egspec_notif_sound') !== 'false';
  });
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    try {
      const data = await portalApi.getNotifications(user.id);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('egspec_notif_sound', String(next));
      if (next) playChime();
      return next;
    });
  };

  const addToast = useCallback((toast: ToastAlert) => {
    setToasts((prev) => [toast, ...prev.slice(0, 4)]);
    if (soundEnabled) {
      playChime();
    }
  }, [soundEnabled]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Listen to cross-system real-time updates and notifications
  useEffect(() => {
    const handleDataUpdate = () => {
      fetchNotifications();
    };

    const handleAlert = (e: CustomEvent<NotificationItem>) => {
      const item = e.detail;
      if (!item) return;

      // Check if alert belongs to current user or broadcast
      const isTargeted =
        item.recipient_id === 'all' ||
        (user?.id && item.recipient_id === user.id);

      if (isTargeted) {
        addToast({
          id: item.id || `toast-${Date.now()}`,
          title: item.title,
          message: item.message,
          type: item.type,
          created_at: item.created_at,
          link: item.link,
          action_label: item.action_label,
          metadata: item.metadata,
        });
      }

      fetchNotifications();
    };

    window.addEventListener('egspec_data_update', handleDataUpdate);
    window.addEventListener('egspec_notification_alert', handleAlert as EventListener);

    return () => {
      window.removeEventListener('egspec_data_update', handleDataUpdate);
      window.removeEventListener('egspec_notification_alert', handleAlert as EventListener);
    };
  }, [fetchNotifications, user?.id, addToast]);

  const markAsRead = async (id: string) => {
    await portalApi.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await portalApi.markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    await portalApi.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = async () => {
    if (!user?.id) return;
    await portalApi.clearAllNotifications(user.id);
    setNotifications([]);
  };

  const notifyEventStatusChange = async (
    event: CollegeEvent,
    newStatus: EventStatus,
    note?: string
  ) => {
    await portalApi.changeEventStatus(event.id, newStatus, note);
    await fetchNotifications();
  };

  const notifyRegistrationConfirmed = async (
    reg: Registration,
    ev: CollegeEvent
  ) => {
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      recipient_id: reg.student_id,
      title: 'Registration Confirmed!',
      message: `Your seat for "${ev.title}" is confirmed. Admission ID: ${reg.registration_id}. Your digital ticket is ready!`,
      type: 'registration',
      is_read: false,
      created_at: new Date().toISOString(),
      link: '/my-tickets',
      action_label: 'View E-Pass Ticket',
      metadata: {
        eventId: ev.id,
        registrationId: reg.registration_id,
        eventTitle: ev.title,
        status: 'confirmed',
        amount: reg.amount_paid,
      },
    };
    await portalApi.createNotification(
      reg.student_id,
      notif.title,
      notif.message,
      'registration',
      notif.link,
      notif.action_label,
      notif.metadata
    );
  };

  const simulateTestAlert = async (scenario: 'registration_confirmed' | 'event_approved' | 'event_cancelled' | 'event_completed') => {
    if (!user?.id) return;

    if (scenario === 'registration_confirmed') {
      const regId = `EVT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      await portalApi.createNotification(
        user.id,
        'Registration Confirmed!',
        `Your seat for "National AI Hackathon 2026" has been confirmed. Pass ID: ${regId}. Access your digital QR ticket anytime in My Tickets.`,
        'registration',
        '/my-tickets',
        'View E-Pass Ticket',
        {
          registrationId: regId,
          eventTitle: 'National AI Hackathon 2026',
          status: 'confirmed',
        }
      );
    } else if (scenario === 'event_approved') {
      await portalApi.createNotification(
        user.id,
        'Event Approved by Dean Office',
        'Your proposal "Cloud DevOps Hands-on Bootcamp 2026" has been reviewed, approved, and published for registrations.',
        'event',
        '/events',
        'View Event Page',
        {
          eventTitle: 'Cloud DevOps Hands-on Bootcamp 2026',
          status: 'approved',
        }
      );
    } else if (scenario === 'event_cancelled') {
      await portalApi.createNotification(
        user.id,
        '⚠️ Event Cancelled Notice',
        'Important: "Robotics Arena Expo" has been cancelled by the administrative committee. Any registered students have been refunded.',
        'event',
        '/events',
        'Review Details',
        {
          eventTitle: 'Robotics Arena Expo',
          status: 'cancelled',
        }
      );
    } else if (scenario === 'event_completed') {
      await portalApi.createNotification(
        user.id,
        '✓ Event Successfully Concluded',
        'Thank you for attending "E.G.S. Annual Sports & Cultural Meet". Your verified attendance certificate is now downloadable in your profile.',
        'event',
        '/my-events',
        'View Certificate',
        {
          eventTitle: 'E.G.S. Annual Sports & Cultural Meet',
          status: 'completed',
        }
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        soundEnabled,
        toasts,
        toggleSound,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        notifyEventStatusChange,
        notifyRegistrationConfirmed,
        dismissToast,
        simulateTestAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
