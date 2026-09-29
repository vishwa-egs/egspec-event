import React, { useRef } from 'react';
import { Category, CollegeEvent } from '../../types';
import {
  Wrench,
  BookOpen,
  Music,
  Cpu,
  Trophy,
  Target,
  Terminal,
  Briefcase,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';

interface CategoryVisualFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  allEvents: CollegeEvent[];
}

interface CategoryVisualMeta {
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  color: {
    activeBorder: string;
    activeBg: string;
    activeText: string;
    badgeBg: string;
    iconBg: string;
    iconColor: string;
  };
}

const CATEGORY_META_MAP: Record<string, CategoryVisualMeta> = {
  workshop: {
    icon: Wrench,
    tagline: 'Hands-on Labs & Coding',
    color: {
      activeBorder: 'border-amber-600 ring-2 ring-amber-600/20',
      activeBg: 'bg-amber-50/70',
      activeText: 'text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-800',
      iconBg: 'bg-amber-100 text-amber-700',
      iconColor: 'text-amber-700',
    },
  },
  seminar: {
    icon: BookOpen,
    tagline: 'Keynotes & Guest Talks',
    color: {
      activeBorder: 'border-indigo-600 ring-2 ring-indigo-600/20',
      activeBg: 'bg-indigo-50/70',
      activeText: 'text-indigo-950',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      iconBg: 'bg-indigo-100 text-indigo-700',
      iconColor: 'text-indigo-700',
    },
  },
  cultural: {
    icon: Music,
    tagline: 'Music, Drama & Arts',
    color: {
      activeBorder: 'border-rose-600 ring-2 ring-rose-600/20',
      activeBg: 'bg-rose-50/70',
      activeText: 'text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-800',
      iconBg: 'bg-rose-100 text-rose-700',
      iconColor: 'text-rose-700',
    },
  },
  technical: {
    icon: Cpu,
    tagline: 'Symposiums & Expos',
    color: {
      activeBorder: 'border-blue-600 ring-2 ring-blue-600/20',
      activeBg: 'bg-blue-50/70',
      activeText: 'text-blue-950',
      badgeBg: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-100 text-blue-700',
      iconColor: 'text-blue-700',
    },
  },
  sports: {
    icon: Trophy,
    tagline: 'Tournaments & Athletics',
    color: {
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-600/20',
      activeBg: 'bg-emerald-50/70',
      activeText: 'text-emerald-950',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-100 text-emerald-700',
      iconColor: 'text-emerald-700',
    },
  },
  competition: {
    icon: Target,
    tagline: 'Design Sprints & Quizzes',
    color: {
      activeBorder: 'border-purple-600 ring-2 ring-purple-600/20',
      activeBg: 'bg-purple-50/70',
      activeText: 'text-purple-950',
      badgeBg: 'bg-purple-100 text-purple-800',
      iconBg: 'bg-purple-100 text-purple-700',
      iconColor: 'text-purple-700',
    },
  },
  hackathon: {
    icon: Terminal,
    tagline: '24-36h Sprint Coding',
    color: {
      activeBorder: 'border-violet-600 ring-2 ring-violet-600/20',
      activeBg: 'bg-violet-50/70',
      activeText: 'text-violet-950',
      badgeBg: 'bg-violet-100 text-violet-800',
      iconBg: 'bg-violet-100 text-violet-700',
      iconColor: 'text-violet-700',
    },
  },
  placement: {
    icon: Briefcase,
    tagline: 'MNC Drives & Interview Prep',
    color: {
      activeBorder: 'border-teal-600 ring-2 ring-teal-600/20',
      activeBg: 'bg-teal-50/70',
      activeText: 'text-teal-950',
      badgeBg: 'bg-teal-100 text-teal-800',
      iconBg: 'bg-teal-100 text-teal-700',
      iconColor: 'text-teal-700',
    },
  },
};

const DEFAULT_META: CategoryVisualMeta = {
  icon: Sparkles,
  tagline: 'Campus Activities',
  color: {
    activeBorder: 'border-slate-800 ring-2 ring-slate-800/20',
    activeBg: 'bg-slate-100',
    activeText: 'text-slate-900',
    badgeBg: 'bg-slate-100 text-slate-800',
    iconBg: 'bg-slate-100 text-slate-700',
    iconColor: 'text-slate-700',
  },
};

export const CategoryVisualFilter: React.FC<CategoryVisualFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  allEvents,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getEventCount = (catId?: string) => {
    if (!catId || catId === 'all') return allEvents.length;
    return allEvents.filter(
      (e) =>
        e.category_id === catId ||
        e.category?.name.toLowerCase() === catId.toLowerCase()
    ).length;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Find active category object if any
  const currentCategory = categories.find(
    (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="space-y-3">
      {/* Top Shelf Bar: Label + Quick Shortcuts + Scroll arrows */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Browse by Event Category</span>
            <span className="text-[11px] font-medium text-slate-400 font-mono">
              ({categories.length + 1} tracks)
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Select a domain to filter campus workshops, symposiums, guest seminars, or cultural meets.
          </p>
        </div>

        {/* Shortcut Quick Links & Scroll Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Quick Category Jump Pills for requested categories */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Popular:</span>
            {['Workshop', 'Seminar', 'Cultural'].map((shortcut) => {
              const matchedCat = categories.find(
                (c) => c.name.toLowerCase() === shortcut.toLowerCase()
              );
              const isSelected =
                selectedCategory === matchedCat?.id ||
                selectedCategory.toLowerCase() === shortcut.toLowerCase();

              return (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => {
                    if (matchedCat) {
                      onSelectCategory(matchedCat.id);
                    } else {
                      onSelectCategory(shortcut.toLowerCase());
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {shortcut}
                </button>
              );
            })}
          </div>

          {/* Scroll Arrows for shelf */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Category Cards Shelf */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
        tabIndex={0}
        aria-label="Categories Carousel"
      >
        {/* 'All Events' Card */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`group flex-shrink-0 w-44 sm:w-48 text-left rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
            selectedCategory === 'all'
              ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-900/20'
              : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between w-full mb-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-900'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>

            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {allEvents.length} events
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs tracking-tight">All Categories</h3>
              {selectedCategory === 'all' && (
                <Check className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              )}
            </div>
            <p
              className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                selectedCategory === 'all' ? 'text-blue-200' : 'text-slate-500'
              }`}
            >
              Full college catalog
            </p>
          </div>
        </button>

        {/* Dynamic Category Cards */}
        {categories.map((cat) => {
          const metaKey = cat.name.toLowerCase();
          const meta = CATEGORY_META_MAP[metaKey] || DEFAULT_META;
          const Icon = meta.icon;
          const isSelected =
            selectedCategory === cat.id ||
            selectedCategory.toLowerCase() === metaKey;
          const count = getEventCount(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex-shrink-0 w-44 sm:w-48 text-left rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? `${meta.color.activeBg} ${meta.color.activeBorder} ${meta.color.activeText} shadow-md`
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? meta.color.iconBg
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? meta.color.badgeBg
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} {count === 1 ? 'event' : 'events'}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs tracking-tight">{cat.name}</h3>
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${meta.color.iconColor} shrink-0`} />
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 leading-snug line-clamp-1 ${
                    isSelected ? 'text-slate-700 font-medium' : 'text-slate-500'
                  }`}
                >
                  {meta.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Filter Info Strip (When a category is active) */}
      {selectedCategory !== 'all' && currentCategory && (
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <div>
              <span className="text-slate-600">Active Category Filter: </span>
              <strong className="text-blue-950 font-bold text-sm mr-2">
                {currentCategory.name}
              </strong>
              <span className="text-slate-500 hidden sm:inline">
                ({getEventCount(currentCategory.id)} events found) · {currentCategory.description}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-900 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset to All Categories</span>
          </button>
        </div>
      )}
    </div>
  );
};
