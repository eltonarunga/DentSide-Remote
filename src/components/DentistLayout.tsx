import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DentistSidebar from './DentistSidebar';
import NotificationMenu from './NotificationMenu';
import SiteFooter from './SiteFooter';

export default function DentistLayout({
  children,
  title,
  showSearch = false,
}: {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
}) {
  const { profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      <DentistSidebar
        pathname={location.pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 border-b border-surface-variant/10 bg-white/85 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] backdrop-blur-xl">
          <div className="page-shell page-padding flex h-20 items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button type="button" className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all" onClick={() => setIsSidebarOpen(true)} aria-label="Toggle navigation menu">
                <span className="material-symbols-outlined">menu</span>
              </button>
              {title && <p className="text-sm font-bold text-sky-900 leading-tight hidden sm:block">{title}</p>}
              {showSearch && (
                <div className="hidden lg:flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-[28rem]">
                  <span className="material-symbols-outlined text-outline">search</span>
                  <input className="bg-transparent border-none focus:ring-0 text-sm w-full font-medium outline-none" placeholder="Search gigs or clinical records..." type="text" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4">
                <NotificationMenu />
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><span className="material-symbols-outlined">settings</span></button>
              </div>
              <div className="hidden xs:block h-10 w-[1px] bg-outline-variant/30"></div>
              <div className="flex items-center gap-3"><div className="text-right hidden sm:block"><p className="text-sm font-bold text-sky-900 leading-tight">{profile?.displayName || 'Doctor'}</p><p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{profile?.experience || 'Dental Specialist'}</p></div><div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container/20"><img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`} alt="avatar" className="w-full h-full object-cover" /></div></div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 section-gap page-padding bg-gradient-to-b from-white/40 to-transparent">
          <div className="page-shell">
            {children}
          </div>
        </main>

        <SiteFooter className="border-t border-surface-variant/10" />
      </div>
    </div>
  );
}
