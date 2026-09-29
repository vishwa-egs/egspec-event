import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { Venue } from '../../types';
import { Plus, Trash2, ArrowLeft, MapPin, Users } from 'lucide-react';

export const AdminVenuesPage: React.FC = () => {
  const { navigate } = useRouter();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(150);
  const [description, setDescription] = useState('');

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const data = await portalApi.getVenues();
      setVenues(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await portalApi.createVenue({
      name: name.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      description: description.trim(),
    });
    setName('');
    setLocation('');
    setDescription('');
    setShowAddModal(false);
    await fetchVenues();
  };

  const handleDeleteVenue = async (id: string) => {
    if (!window.confirm('Delete venue?')) return;
    await portalApi.deleteVenue(id);
    await fetchVenues();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Venues &amp; Facilities
            </h1>
            <p className="text-xs text-slate-500">
              Manage auditorium, seminar halls, sports ground, and lab capacities.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Venue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {venues.map((v) => (
          <div key={v.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{v.name}</span>
                <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Cap: {v.capacity}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{v.location}</span>
              </div>
              {v.description && (
                <p className="text-xs text-slate-500 pt-1 leading-relaxed">{v.description}</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleDeleteVenue(v.id)}
                className="text-xs text-red-600 hover:text-red-800 p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Add Campus Venue</h3>
            <form onSubmit={handleAddVenue} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Seminar Hall"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Block 2nd Floor"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={5000}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Facilities</label>
                <textarea
                  rows={2}
                  placeholder="Projectors, sound system, seating arrangement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
