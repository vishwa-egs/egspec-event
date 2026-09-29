import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { portalApi } from '../services/supabase';
import { CollegeEvent, Category, Venue, Registration } from '../types';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';
import { CategoryVisualFilter } from '../components/events/CategoryVisualFilter';
import { RegistrationModal } from '../components/events/RegistrationModal';
import { DigitalTicket } from '../components/events/DigitalTicket';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, List, Calendar, Sparkles, Filter, X } from 'lucide-react';

export const ExploreEventsPage: React.FC = () => {
  const { searchParams } = useRouter();
  const { user } = useAuth();

  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [allApprovedEvents, setAllApprovedEvents] = useState<CollegeEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [myRegisteredEventIds, setMyRegisteredEventIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState<string>(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category') || 'all');
  const [selectedVenue, setSelectedVenue] = useState<string>(() => searchParams.get('venue') || 'all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedDate, setSelectedDate] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedSort, setSelectedSort] = useState<'upcoming' | 'newest' | 'popular'>('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [registeringEvent, setRegisteringEvent] = useState<CollegeEvent | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Registration | null>(null);

  // Sync category with URL searchParams if URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [filteredEvents, allApproved, allCats, allVenues] = await Promise.all([
        portalApi.getEvents({
          status: 'approved',
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          venue: selectedVenue !== 'all' ? selectedVenue : undefined,
          price: selectedPrice !== 'all' ? selectedPrice : undefined,
          search: search.trim() ? search.trim() : undefined,
          sortBy: selectedSort,
        }),
        portalApi.getEvents({ status: 'approved' }),
        portalApi.getCategories(),
        portalApi.getVenues(),
      ]);

      // Filter by date client-side if selected
      let filtered = filteredEvents;
      const now = new Date();
      if (selectedDate === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        filtered = filtered.filter((e) => e.date === todayStr);
      } else if (selectedDate === 'week') {
        const weekAhead = new Date(now.getTime() + 7 * 86400000);
        filtered = filtered.filter((e) => {
          const d = new Date(e.date);
          return d >= now && d <= weekAhead;
        });
      } else if (selectedDate === 'month') {
        const monthAhead = new Date(now.getTime() + 30 * 86400000);
        filtered = filtered.filter((e) => {
          const d = new Date(e.date);
          return d >= now && d <= monthAhead;
        });
      }

      setEvents(filtered);
      setAllApprovedEvents(allApproved);
      setCategories(allCats);
      setVenues(allVenues);

      if (user?.id) {
        const regs = await portalApi.getMyRegistrations(user.id);
        setMyRegisteredEventIds(regs.filter((r) => r.status === 'confirmed').map((r) => r.event_id));
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedVenue, selectedPrice, selectedDate, selectedSort, user?.id]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const url = new URL(window.location.href);
    if (categoryId === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', categoryId);
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedVenue('all');
    setSelectedPrice('all');
    setSelectedDate('all');
    setSelectedSort('upcoming');
    const url = new URL(window.location.href);
    url.searchParams.delete('category');
    url.searchParams.delete('search');
    url.searchParams.delete('venue');
    window.history.replaceState({}, '', url.toString());
  };

  const activeCategoryObject = categories.find(
    (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Explore College Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover workshops, symposiums, hackathons, seminars and competitions across E.G.S. Pillay Engineering College.
          </p>
        </div>

        {/* View mode toggle & Results count */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            Showing <strong className="text-slate-800">{events.length}</strong> event{events.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Category Filter Component */}
      <CategoryVisualFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        allEvents={allApprovedEvents}
      />

      {/* Filter Component (Search, Sort, Venue, Date, Price) */}
      <EventFilters
        categories={categories}
        venues={venues}
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={handleSelectCategory}
        selectedVenue={selectedVenue}
        onVenueChange={setSelectedVenue}
        selectedPrice={selectedPrice}
        onPriceChange={setSelectedPrice}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        onReset={handleResetFilters}
        hideCategoryRow={true}
      />

      {/* Events Grid / List Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="h-44 bg-slate-200 rounded-lg" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State with Category Awareness */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {selectedCategory !== 'all'
                ? `No Upcoming Events in ${activeCategoryObject?.name || 'this category'}`
                : 'No Upcoming Events Match'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {selectedCategory !== 'all'
                ? `There are currently no events scheduled under "${activeCategoryObject?.name || selectedCategory}". Explore other categories like Workshop, Seminar, or Cultural.`
                : 'There are currently no events matching your active search filters. Try clearing your search keyword or switching filters.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => handleSelectCategory('all')}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Browse All Categories
              </button>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isRegistered={myRegisteredEventIds.includes(ev.id)}
              onRegister={(targetEvent) => setRegisteringEvent(targetEvent)}
            />
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {registeringEvent && (
        <RegistrationModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={(reg) => {
            setRegisteringEvent(null);
            setViewingTicket(reg);
            fetchData();
          }}
        />
      )}

      {/* Digital Ticket Modal */}
      {viewingTicket && (
        <DigitalTicket
          registration={viewingTicket}
          onClose={() => setViewingTicket(null)}
        />
      )}

    </div>
  );
};
