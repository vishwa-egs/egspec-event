import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { portalApi } from '../services/supabase';
import { User, Mail, Phone, Building, Calendar, CheckCircle2, Shield, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [year, setYear] = useState(user?.year || '3rd Year');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setDepartment(user.department || 'CSE');
      setYear(user.year || '3rd Year');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await portalApi.updateProfile(user.id, {
        name,
        phone,
        department,
        year,
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Profile &amp; Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          E.G.S. Pillay Engineering College · Official Academic Identity
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded border border-blue-200">
                Role: {user?.role}
              </span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                ID: {user?.register_number}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Institutional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs p-2.5 pl-9 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Register Number (Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Register Number / Staff ID
              </label>
              <input
                type="text"
                disabled
                value={user?.register_number || ''}
                className="w-full text-xs p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono cursor-not-allowed"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="CSE">Computer Science &amp; Engineering (CSE)</option>
                <option value="ECE">Electronics &amp; Communication (ECE)</option>
                <option value="EEE">Electrical &amp; Electronics (EEE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="AI & DS">Artificial Intelligence &amp; Data Science</option>
                <option value="MBA/MCA">MBA &amp; MCA Department</option>
                <option value="Dean Office">Dean Office (Academic Administration)</option>
              </select>
            </div>

            {/* Year */}
            {user?.role === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="1st Year">1st Year (Fresher)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Pre-final)</option>
                  <option value="4th Year">4th Year (Final Year)</option>
                </select>
              </div>
            )}

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
