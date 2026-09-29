import React from 'react';
import { CollegeEvent } from '../../types';
import { useRouter } from '../../context/RouterContext';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: CollegeEvent;
  onRegister?: (event: CollegeEvent) => void;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister, isRegistered }) => {
  const { navigate } = useRouter();

  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const seatsLeft = Math.max(0, event.max_participants - (event.registered_count || 0));
  const isFull = seatsLeft <= 0;
  const isFree = Number(event.registration_fee) === 0;

  // Domain visual fallback styles based on category
  const getCategoryTheme = (catName?: string) => {
    const name = catName?.toLowerCase() || '';
    if (name.includes('tech') || name.includes('hack')) {
      return {
        bg: 'from-blue-900 to-indigo-950',
        accent: 'text-blue-400',
        badge: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    }
    if (name.includes('cultural') || name.includes('art')) {
      return {
        bg: 'from-rose-900 to-purple-950',
        accent: 'text-rose-400',
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
      };
    }
    if (name.includes('sport')) {
      return {
        bg: 'from-emerald-900 to-teal-950',
        accent: 'text-emerald-400',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (name.includes('work') || name.includes('seminar')) {
      return {
        bg: 'from-amber-900 to-stone-950',
        accent: 'text-amber-400',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      bg: 'from-slate-800 to-slate-950',
      accent: 'text-slate-300',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
    };
  };

  const theme = getCategoryTheme(event.category?.name);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all duration-200 group">
      
      {/* Poster Image / Geometric Domain Canvas */}
      <div
        onClick={() => navigate(`/events/${event.id}`)}
        className={`relative h-44 w-full bg-gradient-to-br ${theme.bg} cursor-pointer overflow-hidden p-4 flex flex-col justify-between`}
      >
        {/* Subtle decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top bar on poster: Category & Department (clean zero-pill styled metadata) */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/90">
          <span className="font-semibold tracking-wider uppercase text-[11px] text-white/80">
            {event.category?.name || 'General Event'}
          </span>
          <span className="font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs text-white/90 border border-white/10">
            Dept: {event.department}
          </span>
        </div>

        {/* Center Title highlight on dark card */}
        <div className="relative z-10">
          <p className="text-white text-lg font-bold tracking-tight line-clamp-2 leading-snug group-hover:text-blue-200 transition-colors">
            {event.title}
          </p>
        </div>

        {/* Bottom Banner on poster: Fee & Status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/80 pt-2 border-t border-white/15">
          <span className="font-bold text-white tracking-tight">
            {isFree ? 'FREE REGISTRATION' : `₹${event.registration_fee} ENTRY`}
          </span>
          <span className="text-[11px] text-white/70">
            {isFull ? 'Housefull' : `${seatsLeft} seats left`}
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Unboxed Metadata Line with separators per Frontend Design constitution */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {event.start_time.slice(0, 5)}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1 truncate max-w-[140px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.venue?.name || 'Campus'}</span>
          </span>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Capacity Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>Registered</span>
            </span>
            <span className="font-mono tabular-nums font-medium text-slate-700">
              {event.registered_count || 0} / {event.max_participants}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{
                width: `${Math.min(100, Math.round(((event.registered_count || 0) / event.max_participants) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-center"
          >
            View Details
          </button>

          {isRegistered ? (
            <button
              onClick={() => navigate('/my-tickets')}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg text-center hover:bg-emerald-100 transition-colors"
            >
              View Ticket
            </button>
          ) : isFull ? (
            <button
              disabled
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed text-center"
            >
              Full
            </button>
          ) : (
            <button
              onClick={() => onRegister ? onRegister(event) : navigate(`/events/${event.id}`)}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors text-center shadow-xs"
            >
              Register Now
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
