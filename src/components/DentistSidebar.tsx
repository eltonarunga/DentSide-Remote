import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Gigs', href: '/opportunities', icon: 'medical_services' },
  { label: 'Wallet', href: '/wallet', icon: 'account_balance_wallet' },
  { label: 'Profile', href: '/verification', icon: 'person' },
];

export default function DentistSidebar({
  pathname,
  isOpen = false,
  onClose,
}: {
  pathname: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 z-50 bg-slate-100 flex flex-col p-6 space-y-2 inset-well transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '24px' }}>
            dentistry
          </span>
        </div>
        <div>
          <h1 className="font-headline text-xl font-bold text-sky-900 leading-tight">DentSide</h1>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            {profile?.role === 'dentist' ? 'Verified Dentist' : 'Specialist'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon }) => (
          <Link
            key={href}
            to={href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(href)
                ? 'bg-white text-primary shadow-sm font-bold'
                : 'text-slate-600 hover:text-primary hover:bg-slate-200/50'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: isActive(href) ? "'FILL' 1" : undefined,
                fontSize: '20px'
              }}
            >
              {icon}
            </span>
            <span className="font-body text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="bg-primary-container/10 p-4 rounded-xl border border-primary/10">
          <p className="text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
            Pro Membership
          </p>
          <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
            Access exclusive high-value case consultations and priority support.
          </p>
          <button className="w-full py-2 bg-primary text-on-primary text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity uppercase tracking-widest">
            Upgrade to Pro
          </button>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-error hover:bg-error-container/20 rounded-lg transition-all duration-200"
            onClick={async () => {
              onClose?.();
              await logout();
              navigate('/');
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              logout
            </span>
            <span className="font-body text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
