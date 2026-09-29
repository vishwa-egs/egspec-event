import React from 'react';
import { Category, Venue } from '../../types';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface EventFiltersProps {
  categories?: Category[];
  venues: Venue[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (id: string) => void;
  selectedVenue: string;
  onVenueChange: (id: string) => void;
  selectedPrice: 'all' | 'free' | 'paid';
  onPriceChange: (price: 'all' | 'free' | 'paid') => void;
  selectedDate: 'all' | 'today' | 'week' | 'month';
  onDateChange: (date: 'all' | 'today' | 'week' | 'month') => void;
  selectedSort: 'upcoming' | 'newest' | 'popular';
  onSortChange: (sort: 'upcoming' | 'newest' | 'popular') => void;
  onReset: () => void;
  hideCategoryRow?: boolean;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  categories = [],
  venues,
  search,
  onSearchChange,
  selectedCategory = 'all',
  onCategoryChange,
  selectedVenue,
  onVenueChange,
  selectedPrice,
  onPriceChange,
  selectedDate,
  onDateChange,
  selectedSort,
  onSortChange,
  onReset,
  hideCategoryRow = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
      
      {/* Top Search bar & Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events by title, keyword, department..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Sort & Quick Reset */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium whitespace-nowrap">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as 'upcoming' | 'newest' | 'popular')}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-800"
            >
              <option value="upcoming">Upcoming Date</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* Category Segmented Tabs (When not superseded by CategoryVisualFilter) */}
      {!hideCategoryRow && onCategoryChange && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => onCategoryChange('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Dropdown Filter Row: Venue, Date, Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        
        {/* Venue Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Venue
          </label>
          <select
            value={selectedVenue}
            onChange={(e) => onVenueChange(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Campus Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Timeline Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Date Schedule
          </label>
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value as 'all' | 'today' | 'week' | 'month')}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">Any Date</option>
            <option value="today">Today Only</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Pricing Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Fee
          </label>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              onClick={() => onPriceChange('all')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPrice === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => onPriceChange('free')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPrice === 'free'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => onPriceChange('paid')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPrice === 'paid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
