import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, type Gig } from '../lib/api';
import { Link, useLocation } from 'react-router-dom';
import DentistSidebar from '../components/DentistSidebar';
import NotificationMenu from '../components/NotificationMenu';
import { Loader2 } from 'lucide-react';

export default function OpportunityEngine() {
  const { profile } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filters
  const [gigType, setGigType] = useState('All Specializations');
  const [minRate, setMinRate] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadGigs = async () => {
      try {
        const data = await apiRequest<Gig[]>('/api/gigs');
        if (!cancelled) {
          setGigs(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : 'Unable to load gigs right now.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadGigs();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleGigs = gigs.filter((gig) => {
    const query = searchQuery.trim().toLowerCase();

    // Search query
    if (query) {
      const match = [gig.title, gig.company, gig.type, gig.description || '', ...gig.tags]
        .join(' ')
        .toLowerCase()
        .includes(query);
      if (!match) return false;
    }

    // Gig Type filter
    if (gigType !== 'All Specializations') {
      if (!gig.type.toLowerCase().includes(gigType.toLowerCase().split(' ')[0])) return false;
    }

    // Min Rate filter
    if (minRate) {
      const rateNum = parseInt(gig.rateLabel.replace(/[^0-9]/g, ''));
      if (!isNaN(rateNum) && rateNum < parseInt(minRate)) return false;
    }

    return true;
  });

  return (
    <div className="flex bg-surface font-body text-on-surface min-h-screen">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-on-surface/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <DentistSidebar
        pathname={location.pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <header className="fixed top-0 right-0 left-0 md:left-64 h-20 z-40 bg-slate-50/80 backdrop-blur-xl flex items-center justify-between px-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] border-b border-surface-variant/5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden p-2 text-slate-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="text-xl font-bold tracking-tighter text-primary-container font-headline hidden sm:block">Marketplace</div>
        </div>

        <div className="flex items-center gap-6">
          <button className="primary-gradient text-white px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest scale-95 active:scale-100 transition-transform hidden sm:block">Post Gig</button>
          <div className="flex items-center gap-4 text-outline">
            <NotificationMenu />
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary-container/20">
              <img
                className="w-full h-full object-cover"
                src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`}
                alt="Profile"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 md:ml-64 pt-24 p-6 md:p-10 lg:p-14 bg-surface">
        {/* Header Section */}
        <div className="mb-10">
          <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Remote Opportunities</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">Gigs Marketplace</h1>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">Precision teledentistry and clinical review roles tailored for elite practitioners. Browse, filter, and apply in seconds.</p>
        </div>

        {/* Bento Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-1 bg-surface-container-lowest editorial-shadow rounded-2xl p-4">
            <label className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2 block">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keywords..."
                className="w-full bg-surface-container-low border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 py-3 px-4 outline-none"
              />
            </div>
          </div>
          <div className="md:col-span-1 bg-surface-container-lowest editorial-shadow rounded-2xl p-4">
            <label className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2 block">Gig Type</label>
            <div className="relative">
              <select
                value={gigType}
                onChange={(e) => setGigType(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none py-3 px-4 outline-none"
              >
                <option>All Specializations</option>
                <option>Teledentistry</option>
                <option>X-ray Review</option>
                <option>Case Consultation</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-outline">expand_more</span>
            </div>
          </div>
          <div className="md:col-span-1 bg-surface-container-lowest editorial-shadow rounded-2xl p-4">
            <label className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2 block">Hourly Rate (Min)</label>
            <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-3">
              <span className="text-on-surface-variant font-bold mr-2">$</span>
              <input
                className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none"
                placeholder="100"
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button className="w-full primary-gradient text-white font-bold h-14 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 scale-95 active:scale-100 transition-transform">
              <span className="material-symbols-outlined">filter_list</span>
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* Gigs Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-slate-500 font-medium font-headline">Scanning for opportunities...</p>
          </div>
        ) : visibleGigs.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-2xl editorial-shadow border border-outline-variant/30">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">No matching gigs found</h3>
            <p className="text-on-surface-variant max-w-md mx-auto">Adjust your filters or search terms to find available clinical opportunities.</p>
            <button
              onClick={() => {setSearchQuery(''); setGigType('All Specializations'); setMinRate('');}}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleGigs.map((gig) => (
              <div key={gig.id} className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow border border-transparent hover:border-primary/20 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {gig.type}
                  </div>
                  <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">bookmark</span>
                </div>
                <h2 className="text-xl font-bold font-headline mb-1 group-hover:text-primary transition-colors">{gig.title}</h2>
                <p className="text-on-surface-variant text-sm mb-4">{gig.company}</p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-outline">
                    <span className="material-symbols-outlined text-sm mr-2">payments</span>
                    <span className="font-semibold text-on-surface">{gig.rateLabel}</span>
                  </div>
                  <div className="flex items-center text-sm text-outline">
                    <span className="material-symbols-outlined text-sm mr-2">schedule</span>
                    <span>{gig.tags[0] || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center text-sm text-outline">
                    <span className="material-symbols-outlined text-sm mr-2">public</span>
                    <span>{gig.remoteOnly ? 'Remote Only' : 'Hybrid / On-site'}</span>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {gig.tags.slice(1, 3).map((tag, i) => (
                      <div key={i} className="px-2 py-1 bg-surface-container text-[9px] font-bold text-outline rounded uppercase border border-white">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <button className="bg-surface-container-high text-on-surface font-bold px-5 py-2 rounded-xl text-xs hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Quick Apply</button>
                </div>
              </div>
            ))}

            {/* Bento Style CTA Card */}
            <div className="primary-gradient rounded-2xl p-8 flex flex-col justify-center text-white editorial-shadow relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[120px]">medical_services</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-4 relative z-10 leading-tight">Can't find the perfect gig?</h3>
              <p className="text-white/80 text-sm mb-8 relative z-10">Upload your credentials and let top-tier clinics reach out to you directly with custom offers.</p>
              <Link to="/verification" className="bg-white text-primary font-bold py-3 rounded-xl uppercase tracking-widest text-xs relative z-10 hover:bg-on-primary-container transition-colors text-center">Complete Profile</Link>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
