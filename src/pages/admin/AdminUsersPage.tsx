import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { portalApi } from '../../services/supabase';
import { Profile, UserRole } from '../../types';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  ArrowLeft,
  Mail,
  Building,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { navigate } = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'organizer' | 'admin'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await portalApi.getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await portalApi.updateProfile(userId, { role: newRole });
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = profiles.filter((p) => {
    if (roleFilter !== 'all' && p.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.register_number?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              User Directory &amp; Roles
            </h1>
            <p className="text-xs text-slate-500">
              Campus accounts for students, faculty organizers, and institutional administrators.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Users: {profiles.length}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        
        {/* Role Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'student', 'organizer', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r} ({profiles.filter((p) => r === 'all' || p.role === r).length})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, reg no, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No users match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Register / Staff ID</th>
                  <th className="py-3 px-4">Department &amp; Year</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                      {p.register_number || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{p.department}</span>
                      {p.year && <span className="text-[11px] text-slate-400 block">{p.year}</span>}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          p.role === 'admin'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : p.role === 'organizer'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <select
                        value={p.role}
                        onChange={(e) => handleRoleChange(p.id, e.target.value as UserRole)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="student">Student</option>
                        <option value="organizer">Organizer (Faculty)</option>
                        <option value="admin">Administrator (Dean)</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
