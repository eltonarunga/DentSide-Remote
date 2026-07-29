import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Search, Calendar } from 'lucide-react';

export default function ClientDashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <UserIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">DentSide Client</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden sm:block">
            {profile?.displayName || profile?.email}
          </span>
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-slate-100"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-shell">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 font-headline">Welcome to your Client Portal</h1>
        
        {/* Bento grids across all dashboards use a uniform gap-8 (32px) */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Cards within those grids use p-8 (32px) internal padding */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors text-blue-600">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 font-headline">Find a Dentist</h2>
            <p className="text-slate-600 text-sm leading-relaxed">Search our global network of verified dental professionals for consults or freelance work.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors text-teal-600">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 font-headline">My Appointments</h2>
            <p className="text-slate-600 text-sm leading-relaxed">View your upcoming teledentistry sessions and past consultation notes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
