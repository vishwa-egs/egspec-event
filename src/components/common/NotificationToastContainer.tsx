import React, { useEffect, useState } from 'react';
import { useNotifications, ToastAlert } from '../../context/NotificationContext';
import { useRouter } from '../../context/RouterContext';
import {
  Ticket,
  Calendar,
  Bell,
  Shield,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ToastItemProps {
  toast: ToastAlert;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { navigate } = useRouter();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 6500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.id, onDismiss]);

  const isRegistration = toast.type === 'registration';
  const isCancelled =
    toast.metadata?.status === 'cancelled' ||
    toast.title.toLowerCase().includes('cancelled');
  const isApproved =
    toast.metadata?.status === 'approved' ||
    toast.title.toLowerCase().includes('approved');

  const getBorderColor = () => {
    if (isCancelled) return 'border-red-400 bg-red-50/95';
    if (isRegistration || isApproved) return 'border-emerald-400 bg-emerald-50/95';
    return 'border-blue-400 bg-white/98';
  };

  const getIcon = () => {
    if (isCancelled) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    if (isRegistration) {
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
    return (
      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
        <Calendar className="w-4 h-4" />
      </div>
    );
  };

  const handleAction = () => {
    if (toast.link) {
      navigate(toast.link);
      onDismiss(toast.id);
    }
  };

  return (
    <div
      role="alert"
      className={`relative w-84 sm:w-96 rounded-xl border shadow-xl backdrop-blur-md overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${getBorderColor()}`}
    >
      <div className="p-3.5 flex items-start gap-3">
        {getIcon()}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {isRegistration
                ? 'Ticket Alert'
                : isCancelled
                ? 'Cancellation Notice'
                : 'Event Status Alert'}
            </span>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>

          <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
            {toast.title}
          </h4>

          <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
            {toast.message}
          </p>

          {toast.link && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAction}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 hover:text-blue-700 hover:underline"
              >
                <span>{toast.action_label || 'View Details'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/60 h-0.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${
            isCancelled ? 'bg-red-500' : isRegistration ? 'bg-emerald-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const NotificationToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 pointer-events-none no-print max-h-[80vh] overflow-y-auto pr-1"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};
