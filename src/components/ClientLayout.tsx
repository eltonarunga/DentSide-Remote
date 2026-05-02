import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BrandMark from './BrandMark';
import NotificationMenu from './NotificationMenu';
import SiteFooter from './SiteFooter';

const CLIENT_NAV_ITEMS = [
  { label: 'Dashboard', href: '/client-dashboard', icon: 'dashboard' },
  { label: 'Gig Studio', href: '/gig-studio', icon: 'work' },
  { label: 'Find a Dentist', href: '/client/network', icon: 'person_search' },
  { label: 'Appointments', href: '/client/appointments', icon: 'event' },
];

export default function ClientLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <div className="flex bg-surface font-body text-on-surface min-h-screen antialiased">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-on-surface/40 z-[60] md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-[70] bg-slate-100 flex flex-col p-6 space-y-2 inset-well transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '24px' }}>
              clinical_notes
            </span>
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold text-sky-900 leading-tight">DentSide</h1>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Client Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {CLIENT_NAV_ITEMS.map(({ label, href, icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setIsSidebarOpen(false)}
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
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200 space-y-4">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-error hover:bg-error-container/20 rounded-lg transition-all duration-200"
            onClick={async () => {
              setIsSidebarOpen(false);
              await logout();
              navigate('/');
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              logout
            </span>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 h-20 z-50 bg-slate-50/80 backdrop-blur-xl flex items-center justify-between px-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] border-b border-surface-variant/5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <p className="text-sm font-bold text-sky-900 leading-tight hidden sm:block">
              {title}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <NotificationMenu />
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div className="hidden xs:block h-10 w-[1px] bg-outline-variant/30"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-sky-900 leading-tight">
                  {profile?.displayName || 'Client'}
                </p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
                  Clinical Partner
                </p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container/20">
                <img
                  src={
                    profile?.photoURL ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'C'}`
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 md:p-8 lg:p-12">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>

        <SiteFooter className="border-t border-surface-variant/10" />
      </div>
    </div>
  );
}
