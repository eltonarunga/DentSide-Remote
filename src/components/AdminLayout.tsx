import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationMenu from './NotificationMenu';

const ADMIN_NAV_ITEMS = [
  { label: 'Overview', hash: '#overview', icon: 'monitoring' },
  { label: 'Users', hash: '#users', icon: 'group' },
  { label: 'Verification', hash: '#verifications', icon: 'verified_user' },
  { label: 'Marketplace', hash: '#gigs', icon: 'work' },
  { label: 'Appointments', hash: '#appointments', icon: 'event' },
  { label: 'Withdrawals', hash: '#withdrawals', icon: 'account_balance_wallet' },
];

export default function AdminLayout({
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

  const activeHash = useMemo(() => location.hash || '#overview', [location.hash]);

  const handleNav = (hash: string) => {
    setIsSidebarOpen(false);

    if (typeof window === 'undefined') {
      return;
    }

    const sectionId = hash.replace('#', '');
    const target = document.getElementById(sectionId);

    navigate(`/admin${hash}`, { replace: true });

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.location.hash = hash;
  };

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
        className={`fixed left-0 top-0 h-screen w-64 z-[70] bg-slate-900 flex flex-col p-6 space-y-2 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '24px' }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold text-white leading-tight">DentSide</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Command</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Console</p>
          </div>
          {ADMIN_NAV_ITEMS.map(({ label, hash, icon }) => (
            <button
              key={hash}
              type="button"
              onClick={() => handleNav(hash)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                activeHash === hash
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: activeHash === hash ? "'FILL' 1" : undefined,
                  fontSize: '20px'
                }}
              >
                {icon}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}

          <div className="px-3 mt-6 mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tools</p>
          </div>
          <Link
            to="/gig-studio"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === '/gig-studio'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>work_history</span>
            <span className="text-sm font-medium">Gig Studio</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>public</span>
            <span className="text-sm font-medium">Public Site</span>
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-error hover:bg-error-container/10 rounded-lg transition-all duration-200"
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
        <header className="sticky top-0 z-50 border-b border-surface-variant/10 bg-white/85 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] backdrop-blur-xl">
          <div className="page-shell page-padding flex h-20 items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button type="button" className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all" onClick={() => setIsSidebarOpen(true)} aria-label="Toggle navigation menu"><span className="material-symbols-outlined">menu</span></button>
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full"><span className="material-symbols-outlined text-primary text-sm">shield</span><span className="text-[10px] font-bold text-primary uppercase tracking-widest">Admin Control</span></div>
              <p className="text-sm font-bold text-sky-900 leading-tight hidden sm:block">{title}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6"><div className="flex items-center gap-4"><NotificationMenu /><button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><span className="material-symbols-outlined">settings</span></button></div><div className="hidden xs:block h-10 w-[1px] bg-outline-variant/30"></div><div className="flex items-center gap-3"><div className="text-right hidden sm:block"><p className="text-sm font-bold text-sky-900 leading-tight">{profile?.displayName || 'Admin'}</p><p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">System Administrator</p></div><div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container/20"><img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'A'}`} alt="avatar" className="w-full h-full object-cover" /></div></div></div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 section-gap page-padding bg-gradient-to-b from-white/40 to-transparent">
          <div className="page-shell">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
