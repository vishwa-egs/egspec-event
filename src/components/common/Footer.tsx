import React from 'react';
import { isSupabaseConfigured } from '../../services/supabase';
import { MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';
import { Link } from '../../context/RouterContext';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: College Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                EGS
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">E.G.S. Pillay Engineering College</h3>
                <p className="text-[11px] text-slate-400">Autonomous Institution · Estd. 1995</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              &quot;Together We Celebrate, Learn &amp; Grow&quot; — Fostering technical excellence, artistic creativity, and sportsmanship across Nagapattinam and beyond.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded w-fit border border-slate-700/60">
              <Award className="w-3.5 h-3.5" />
              <span>Accredited NAAC &apos;A&apos; Grade · NBA Accredited</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Portal Navigation</h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/events" className="text-slate-400 hover:text-white transition-colors">
                  Explore Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/my-events" className="text-slate-400 hover:text-white transition-colors">
                  My Registered Events
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="text-slate-400 hover:text-white transition-colors">
                  Digital Tickets &amp; QR Codes
                </Link>
              </li>
              <li>
                <Link to="/organizer/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Event Organizer Console
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Dean Office Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Departments */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Academic Departments</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400">
              <span>Computer Science (CSE)</span>
              <span>Information Tech (IT)</span>
              <span>Electronics (ECE)</span>
              <span>Electrical (EEE)</span>
              <span>Mechanical (MECH)</span>
              <span>Civil Engineering</span>
              <span>AI &amp; Data Science</span>
              <span>MBA &amp; MCA</span>
            </div>
          </div>

          {/* Col 4: Campus Contact & System Info */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Campus Contact</h4>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Nagapattinam - 611 002, Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>+91 4365 251112 / 251114</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>events@egspec.org / dean@egspec.org</span>
              </div>
            </div>

            {/* Supabase Status */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-blue-400'}`} />
                <span>
                  Backend: {isSupabaseConfigured ? 'Supabase Cloud (PostgreSQL)' : 'Supabase Reactive Storage (Ready)'}
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-2">
          <p>© 2026 E.G.S. Pillay Engineering College. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Anna University Affiliation</span>
            <span>·</span>
            <span>AICTE Approved</span>
            <span>·</span>
            <span>Autonomous Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
