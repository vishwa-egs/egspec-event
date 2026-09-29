import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { portalApi } from '../services/supabase';
import { CollegeEvent, Category, Venue } from '../types';
import { EventCard } from '../components/events/EventCard';
import { DigitalTicket } from '../components/events/DigitalTicket';
import { RegistrationModal } from '../components/events/RegistrationModal';
import { Registration } from '../types';
import {
  Search,
  ArrowRight,
  Calendar,
  Users,
  Award,
  MapPin,
  Cpu,
  Music,
  Trophy,
  Wrench,
  BookOpen,
  Target,
  Code2,
  Briefcase,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Technical: <Cpu className="w-5 h-5 text-blue-600" />,
  Cultural: <Music className="w-5 h-5 text-rose-600" />,
  Sports: <Trophy className="w-5 h-5 text-emerald-600" />,
  Workshop: <Wrench className="w-5 h-5 text-amber-600" />,
  Seminar: <BookOpen className="w-5 h-5 text-indigo-600" />,
  Competition: <Target className="w-5 h-5 text-purple-600" />,
  Hackathon: <Code2 className="w-5 h-5 text-cyan-600" />,
  Placement: <Briefcase className="w-5 h-5 text-teal-600" />,
  Others: <Sparkles className="w-5 h-5 text-slate-600" />,
};

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedEventForReg, setSelectedEventForReg] = useState<CollegeEvent | null>(null);
  const [activeTicket, setActiveTicket] = useState<Registration | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [evs, cats, vens] = await Promise.all([
          portalApi.getEvents({ status: 'approved' }),
          portalApi.getCategories(),
          portalApi.getVenues(),
        ]);
        setEvents(evs);
        setCategories(cats);
        setVenues(vens);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const totalParticipantsCount = events.reduce((acc, curr) => acc + (curr.registered_count || 0), 0);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white overflow-hidden py-16 md:py-24">
        {/* Subtle patterned backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #60A5FA 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center md:text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/80 border border-blue-700/60 text-blue-200">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                <span>E.G.S. Pillay Engineering College · Nagapattinam</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Discover, Register &amp; Lead Campus Events
                </h1>
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                  &quot;Together We Celebrate, Learn &amp; Grow&quot; — Explore university symposiums, technical hackathons, cultural galas, athletic tournaments, and industry seminars.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleHeroSearch} className="max-w-xl flex items-center bg-white rounded-xl p-1.5 shadow-xl border border-slate-200">
                <div className="flex-1 flex items-center pl-3">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workshops, cricket, hackathons..."
                    className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none py-1.5"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Stats Bar */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl border-t border-slate-800/80">
                <div>
                  <span className="font-mono text-2xl font-extrabold text-white block">
                    {events.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Live Events</span>
                </div>
                <div>
                  <span className="font-mono text-2xl font-extrabold text-white block">
                    {totalParticipantsCount}+
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Registrations</span>
                </div>
                <div>
                  <span className="font-mono text-2xl font-extrabold text-white block">
                    {categories.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Categories</span>
                </div>
                <div>
                  <span className="font-mono text-2xl font-extrabold text-white block">
                    {venues.length}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Campus Venues</span>
                </div>
              </div>

            </div>

            {/* Right Card Spotlight */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-700">
                  <span className="font-semibold uppercase tracking-wider text-blue-400">Campus Highlight</span>
                  <span className="font-mono">Oct 2026</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                    Flagship Event
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    HackEGSPC 2026: 24-Hour Campus Hackathon
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Build hardware &amp; software solutions for smart coastal education &amp; healthcare. Cash prizes of ₹50,000!
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>24 October 2026 · 09:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Central Library Digital Wing</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/events/e1000000-0000-0000-0000-000000000002')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Explore Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Categories Grid (Section 24) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Event Categories
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a category to filter technical bootcamps, cultural extravaganzas, and tournaments.
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/events?category=${cat.id}`)}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-900/40 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col items-center text-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                {CATEGORY_ICON_MAP[cat.name] || <Sparkles className="w-5 h-5 text-blue-900" />}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Upcoming College Events
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official events approved by E.G.S. Pillay Engineering College administration.
            </p>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Browse Full Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 h-80 animate-pulse p-4 space-y-3">
                <div className="h-40 bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Events Scheduled</h3>
            <p className="text-xs text-slate-400">Check back soon for new announcements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={(ev) => setSelectedEventForReg(ev)}
              />
            ))}
          </div>
        )}
      </section>

      {/* College Notice / Bulletin Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200 bg-blue-800/80 px-2.5 py-0.5 rounded border border-blue-700/60 inline-block">
              Student Information
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Instant Digital Admission &amp; Attendance QR
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Upon registering for any event, a personalized digital QR pass will be issued immediately. Present your pass at the entrance for fast contactless verification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/my-tickets')}
              className="px-5 py-2.5 bg-white text-blue-950 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors shadow-xs whitespace-nowrap"
            >
              Access My Tickets
            </button>
            <button
              onClick={() => navigate('/events')}
              className="px-5 py-2.5 bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors border border-blue-700/60 whitespace-nowrap"
            >
              Explore Events
            </button>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {selectedEventForReg && (
        <RegistrationModal
          event={selectedEventForReg}
          onClose={() => setSelectedEventForReg(null)}
          onSuccess={(reg) => {
            setSelectedEventForReg(null);
            setActiveTicket(reg);
          }}
        />
      )}

      {/* Digital Ticket Modal */}
      {activeTicket && (
        <DigitalTicket
          registration={activeTicket}
          onClose={() => setActiveTicket(null)}
        />
      )}

    </div>
  );
};
