import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';

export default function ClientDashboard() {
  const { profile } = useAuth();
  const firstName =
    typeof profile?.displayName === 'string' && profile.displayName.trim()
      ? profile.displayName.trim().split(/\s+/)[0]
      : 'there';

  return (
    <ClientLayout title="Dashboard">
      {/* Welcome Section */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="pl-4 border-l-4 border-primary">
          <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            Welcome, {firstName}
          </h2>
          <p className="text-on-surface-variant font-medium max-w-lg">
            Access your appointments, find dental professionals, and manage your clinical consultations all in one place.
          </p>
        </div>
      </section>

      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Network Access Card */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Global Network</span>
                <h3 className="text-slate-500 font-medium">Find Verified Specialists</h3>
              </div>
              <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">person_search</span>
            </div>

            <p className="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-md">
              Browse our curated marketplace of board-certified dentists ready for remote consultations, case reviews, and teledentistry triage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-xs text-outline font-medium mb-1">Network Strength</p>
                <p className="text-2xl font-bold text-on-surface">500+ <span className="text-sm font-normal text-outline">verified</span></p>
              </div>
              <div className="flex items-center justify-end">
                <Link
                  to="/client/network"
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg shadow-primary/30 active:scale-95 transition-all text-center w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  Browse Network
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Gigs Card */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xl font-bold text-on-surface">Gig Studio</h3>
              <span className="material-symbols-outlined text-tertiary">work</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Create, edit, and publish listings for remote dental work to attract top-tier talent for your clinic.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-variant/20 shadow-sm">
                <span className="material-symbols-outlined text-primary text-xl">post_add</span>
                <span className="text-xs font-bold text-on-surface">Post New Opportunity</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-surface-variant/20 shadow-sm opacity-60">
                <span className="material-symbols-outlined text-primary text-xl">analytics</span>
                <span className="text-xs font-bold text-on-surface">View Gig Metrics</span>
              </div>
            </div>
          </div>
          <Link
            to="/gig-studio"
            className="w-full mt-8 py-3 text-center outline outline-primary/20 text-primary font-bold text-sm rounded-xl hover:bg-white transition-all duration-300 uppercase tracking-widest"
          >
            Open Gig Studio
          </Link>
        </div>

        {/* Recent Appointments Section */}
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface">Scheduled Consults</h3>
            <Link to="/client/appointments" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Manage All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white p-12 rounded-xl shadow-[0px_12px_32px_rgba(25,28,30,0.04)] border border-surface-variant/10 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">event_busy</span>
            <h4 className="font-bold text-on-surface mb-2">No Active Consultations</h4>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              You haven't scheduled any teledentistry sessions yet. Connect with a specialist from the network to get started.
            </p>
            <Link
              to="/client/network"
              className="mt-6 px-6 py-3 bg-surface-container-high text-on-surface font-bold text-xs rounded-xl uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all"
            >
              Start Finding
            </Link>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface">Portal Activity</h3>
            <span className="material-symbols-outlined text-primary">monitoring</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
            <div className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow border border-transparent">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">security</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">Compliance Check</h4>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">HIPAA Validated</p>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your portal is running in secure mode. All consults and case files are encrypted following standard healthcare protocols.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/50">
              <h4 className="font-bold text-on-surface text-sm mb-3">Partner Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-on-surface-variant">Active Gigs</span>
                  <span className="text-[11px] font-bold text-on-surface">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-on-surface-variant">Pending Consults</span>
                  <span className="text-[11px] font-bold text-on-surface">0</span>
                </div>
                <div className="w-full h-[1px] bg-outline-variant/20"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-on-surface-variant">Last Activity</span>
                  <span className="text-[11px] font-bold text-primary">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
