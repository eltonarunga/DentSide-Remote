import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import ClientLayout from '../components/ClientLayout';

export default function ClientDashboard() {
  const { profile } = useAuth();

  return (
    <ClientLayout title="Client Dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Client Portal</p>
          <h1 className="ds-page-title">
            Welcome, {profile?.displayName?.split(' ')[0] || 'there'}
          </h1>
          <p className="ds-page-subtitle">
            Access your appointments, find dental professionals, and manage your consultations all in one place.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          {/* Find a Dentist */}
          <Link
            to="/client/network"
            className="ds-card no-underline p-7 focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.25)]"
          >
            <div className="ds-feature-icon mb-4">
              <Search size={20} color="var(--color-blue)" />
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--color-ink)] mb-2">
              Find a Dentist
            </h2>
            <p className="text-[13px] text-[var(--color-ink-4)] leading-relaxed mb-5">
              Search our global network of verified dental professionals for consults or freelance work.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-blue)] font-semibold">
              Browse Network <ArrowRight size={13} />
            </div>
          </Link>

          {/* My Appointments */}
          <Link
            to="/client/appointments"
            className="ds-card no-underline p-7 focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.25)]"
          >
            <div className="ds-feature-icon mb-4 bg-[var(--color-blue-light)]">
              <Calendar size={20} color="var(--color-blue)" />
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--color-ink)] mb-2">
              My Appointments
            </h2>
            <p className="text-[13px] text-[var(--color-ink-4)] leading-relaxed mb-5">
              View your upcoming teledentistry sessions and past consultation notes.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-blue)] font-semibold">
              View Appointments <ArrowRight size={13} />
            </div>
          </Link>
        </div>

        {/* Empty state for appointments */}
        <div className="ds-card p-12 text-center flex flex-col items-center gap-4">
          <Calendar
            size={36}
            color="var(--color-fog-3)"
            className="mx-auto"
          />
          <h4 className="font-semibold text-[var(--color-ink)] mb-1.5">
            No Upcoming Appointments
          </h4>
          <p className="text-[13px] text-[var(--color-ink-4)] max-w-[340px] mx-auto mb-5">
            You don't have any teledentistry sessions scheduled. Find a dental professional to get started.
          </p>
          <Link to="/client/network" className="ds-btn ds-btn-primary ds-btn-sm no-underline inline-flex items-center justify-center gap-2">
            <Search size={14} /> Find a Dentist
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}
