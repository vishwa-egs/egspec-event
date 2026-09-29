import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { Category, Venue } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const CreateEventPage: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [venueId, setVenueId] = useState('');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('16:30');
  const [eligibility, setEligibility] = useState('Open to all departments and academic years');
  const [maxParticipants, setMaxParticipants] = useState(120);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [rules, setRules] = useState('1. College ID card is mandatory for entrance verification.\n2. Bring personal laptop with required development software.\n3. Digital attendance scan will be done at the venue door.');

  // Schedule agenda items
  const [schedules, setSchedules] = useState<Array<{ schedule_time: string; title: string; description: string }>>([
    { schedule_time: '09:30', title: 'Registration & Check-in', description: 'Verification of digital QR passes.' },
    { schedule_time: '10:00', title: 'Inaugural Keynote Session', description: 'Opening remarks by Chief Guest and HOD.' },
    { schedule_time: '11:30', title: 'Technical Workshop Track 1', description: 'Hands-on architectural coding session.' },
    { schedule_time: '13:00', title: 'Lunch & Networking Break', description: 'Campus dining hall.' },
    { schedule_time: '14:00', title: 'Track 2 & Project Hackathon', description: 'Team challenges and evaluation.' },
    { schedule_time: '16:00', title: 'Valedictory & Certificate Distribution', description: 'Awards for top participants.' },
  ]);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [cats, vens] = await Promise.all([
          portalApi.getCategories(),
          portalApi.getVenues(),
        ]);
        setCategories(cats);
        setVenues(vens);
        if (cats.length > 0) setCategoryId(cats[0].id);
        if (vens.length > 0) setVenueId(vens[0].id);

        // Default date 2 weeks ahead
        const defaultDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        setDate(defaultDate);
        setRegistrationDeadline(`${defaultDate}T18:00`);
      } catch (err) {
        console.error(err);
      }
    };
    loadPrerequisites();
  }, []);

  const handleAddScheduleRow = () => {
    setSchedules([...schedules, { schedule_time: '14:00', title: '', description: '' }]);
  };

  const handleRemoveScheduleRow = (idx: number) => {
    setSchedules(schedules.filter((_, i) => i !== idx));
  };

  const handleScheduleChange = (idx: number, field: string, val: string) => {
    const updated = [...schedules];
    updated[idx] = { ...updated[idx], [field]: val };
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }
    if (!date) {
      setError('Please select an event date.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await portalApi.createEvent(
        {
          title,
          description,
          category_id: categoryId,
          venue_id: venueId,
          department,
          date,
          start_time: startTime,
          end_time: endTime,
          eligibility,
          max_participants: Number(maxParticipants),
          registration_fee: Number(registrationFee),
          registration_deadline: registrationDeadline || `${date}T18:00:00Z`,
          rules,
          organizer_id: user?.id,
          status: user?.role === 'admin' ? 'approved' : 'pending',
        },
        schedules.filter((s) => s.title.trim())
      );

      navigate('/organizer/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <button
          onClick={() => navigate('/organizer/dashboard')}
          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create College Event
          </h1>
          <p className="text-xs text-slate-500">
            Submit event proposal for Dean Office approval and student registration.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Event Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. National Level Technical Symposium &amp; Hackathon"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Host Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              >
                <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
                <option value="ECE">Electronics &amp; Communication (ECE)</option>
                <option value="EEE">Electrical &amp; Electronics (EEE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="AI &amp; DS">Artificial Intelligence &amp; Data Science</option>
                <option value="MBA/MCA">MBA &amp; MCA Department</option>
                <option value="Physical Education">Physical Education &amp; Sports</option>
                <option value="Fine Arts Club">Fine Arts &amp; Cultural Club</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive summary of event goals, chief guests, workshop topics, and learning outcomes..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900"
              />
            </div>

          </div>
        </div>

        {/* Date, Time & Venue Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Schedule, Venue &amp; Capacity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Event Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            {/* Venue */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Venue *
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.location}) — Max Capacity: {v.capacity}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Seat Capacity *
              </label>
              <input
                type="number"
                min={10}
                max={3000}
                required
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
              />
            </div>

          </div>
        </div>

        {/* Pricing & Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            3. Registration Details &amp; Eligibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
                placeholder="0 for Free"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">Set 0 for complimentary free event</span>
            </div>

            {/* Deadline */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            {/* Eligibility */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Eligibility Criteria
              </label>
              <input
                type="text"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="e.g. Open to 2nd, 3rd, 4th year CSE &amp; IT students"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            {/* Rules */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rules &amp; Regulations
              </label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono text-[11px]"
              />
            </div>

          </div>
        </div>

        {/* Dynamic Agenda Timeline Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Event Agenda &amp; Timetable
            </h2>
            <button
              type="button"
              onClick={handleAddScheduleRow}
              className="text-xs text-blue-900 font-semibold hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Schedule Slot</span>
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="time"
                  value={row.schedule_time}
                  onChange={(e) => handleScheduleChange(idx, 'schedule_time', e.target.value)}
                  className="w-24 text-xs p-1.5 bg-white border border-slate-200 rounded font-mono"
                />
                <input
                  type="text"
                  placeholder="Session title..."
                  value={row.title}
                  onChange={(e) => handleScheduleChange(idx, 'title', e.target.value)}
                  className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Short description..."
                  value={row.description}
                  onChange={(e) => handleScheduleChange(idx, 'description', e.target.value)}
                  className="flex-1 hidden md:block text-xs p-1.5 bg-white border border-slate-200 rounded text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveScheduleRow(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Remove slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/organizer/dashboard')}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Event Proposal'}
          </button>
        </div>

      </form>

    </div>
  );
};
