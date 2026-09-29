import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { AlertCircle, User, Mail, Lock, Building, Calendar } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const { navigate } = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('1st Year');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsLoading(true);
    setError(null);

    const res = await signUp(
      {
        name: name.trim(),
        email: email.trim(),
        register_number: registerNumber.trim(),
        department,
        year: role === 'student' ? year : 'Faculty Staff',
        phone: phone.trim(),
        role,
      },
      password
    );

    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
    } else {
      if (role === 'organizer') navigate('/organizer/dashboard');
      else navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white font-extrabold text-lg shadow-sm">
            EGS
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Create Portal Account
          </h1>
          <p className="text-xs text-slate-500">
            E.G.S. Pillay Engineering College, Nagapattinam
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Segmented control */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registering As:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    role === 'student' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    role === 'organizer' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Faculty / Organizer
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vishwa S."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Email & Register No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="vishwaegs@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {role === 'student' ? 'Register Number *' : 'Staff Employee ID *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'student' ? '820822104055' : 'STAFF-CSE-102'}
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Department & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="EEE">Electrical (EEE)</option>
                  <option value="IT">Information Tech (IT)</option>
                  <option value="MECH">Mechanical (MECH)</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="AI & DS">AI &amp; Data Science</option>
                  <option value="MBA/MCA">MBA &amp; MCA</option>
                </select>
              </div>

              {role === 'student' && (
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-1">
            <span>Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-blue-900 font-semibold hover:underline"
            >
              Sign In
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
