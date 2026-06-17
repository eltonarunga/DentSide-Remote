import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, Search, Sparkles, Filter, X } from 'lucide-react';

interface Gig {
  id: string;
  title: string;
  company: string;
  type: string;
  rate: string;
  rateNum: number;
  location: string;
  tags: string[];
  match: string;
}

const ALL_GIGS: Gig[] = [
  {
    id: 'gig-1',
    title: 'Teledentistry Consultation Specialist',
    company: 'Delta Dental Advisors',
    type: 'Teledentistry',
    rate: '$95/hr',
    rateNum: 95,
    location: 'Remote',
    tags: ['Invisalign', 'Treatment Plan', 'Part-Time'],
    match: '98%',
  },
  {
    id: 'gig-2',
    title: 'Dental AI Clinical Reviewer',
    company: 'DentAI Solutions',
    type: 'Freelance',
    rate: '$120/hr',
    rateNum: 120,
    location: 'Remote',
    tags: ['Dental AI', 'iTero Scanning', 'Flexible'],
    match: '95%',
  },
  {
    id: 'gig-3',
    title: 'Telediagnostics Night Consult Specialist',
    company: 'Apex Emergency Dental',
    type: 'Teledentistry',
    rate: '$115/hr',
    rateNum: 115,
    location: 'Remote',
    tags: ['Urgent Advice', 'Radiology', 'On-Call'],
    match: '91%',
  },
  {
    id: 'gig-4',
    title: 'Insurance Diagnostic Claims Adjuster',
    company: 'MetLife Health Review',
    type: 'Insurance',
    rate: '$85/hr',
    rateNum: 85,
    location: 'Remote',
    tags: ['Orthodontics', 'Claims', 'Contract'],
    match: '88%',
  }
];

export default function OpportunityEngine() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRateLimit, setSelectedRateLimit] = useState<boolean>(false);
  const [appliedGigIds, setAppliedGigIds] = useState<string[]>([]);
  const [applyingGigId, setApplyingGigId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApply = async (gigId: string, title: string) => {
    if (!profile?.onboardingComplete) {
      triggerToast('Verification required. Please verify your license first!');
      return;
    }
    setApplyingGigId(gigId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAppliedGigIds(prev => [...prev, gigId]);
      triggerToast(`Successfully applied to: ${title}!`);
    } catch {
      triggerToast('Unable to file application. Please retry.');
    } finally {
      setApplyingGigId(null);
    }
  };

  const filteredGigs = useMemo(() => {
    return ALL_GIGS.filter(gig => {
      const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            gig.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            gig.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = selectedType === 'All' || gig.type === selectedType;
      
      const matchesRate = !selectedRateLimit || gig.rateNum >= 100;

      return matchesSearch && matchesType && matchesRate;
    });
  }, [searchQuery, selectedType, selectedRateLimit]);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-12 relative animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#001D32] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/30 animate-bounce">
          <span className="material-symbols-outlined text-[#0077B6]">info</span>
          <p className="text-xs font-bold tracking-tight uppercase font-label">{toastMessage}</p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm h-16 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm font-label transition-colors">Dashboard</Link>
          <Link to="/opportunities" className="text-[#0077B6] font-semibold text-sm font-label transition-colors">Gigs</Link>
          <Link to="/wallet" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm font-label transition-colors">Wallet</Link>
          <Link to="/verification" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm font-label transition-colors">Profile</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-[#0077B6] hover:bg-[#f7f9fb] transition-colors scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden">
            <img alt="User avatar" src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Banner warning if unverified */}
        {!profile?.onboardingComplete && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
              <div>
                <p className="font-bold text-sm">Credentials Unverified</p>
                <p className="text-xs text-amber-700">You must verify your board credentials to activate applications on high-value remote gigs.</p>
              </div>
            </div>
            <Link to="/verification" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-amber-700 transition-colors">
              Verify Now
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Opportunity Engine</h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">Filter, match, and instantly file credentials on state-sanctioned clinical advisor roles and corporate teledentistry programs.</p>
        </div>

        {/* Dynamic Filter Section */}
        <section className="bg-surface-container-low rounded-xl p-4 mb-8 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-lg pl-10 h-11 text-sm focus:ring-2 focus:ring-[#0077B6]" 
              placeholder="Search by role, company, specializations..." 
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Selector */}
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-surface-container-lowest px-4 h-11 flex items-center gap-2 rounded-lg cursor-pointer border-none text-sm font-semibold text-on-surface shadow-sm focus:ring-2 focus:ring-[#0077B6]"
            >
              <option value="All">All Types</option>
              <option value="Teledentistry">Teledentistry</option>
              <option value="Freelance">Freelance</option>
              <option value="Insurance">Insurance</option>
            </select>

            {/* Rate selector */}
            <button 
              onClick={() => setSelectedRateLimit(prev => !prev)}
              className={`px-4 h-11 flex items-center gap-2 rounded-lg cursor-pointer shadow-sm transition-all text-sm font-semibold ${
                selectedRateLimit ? 'bg-[#0077B6] text-white' : 'bg-surface-container-lowest text-on-surface hover:bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              <span>$100+/hr Only</span>
            </button>

            {(searchQuery || selectedType !== 'All' || selectedRateLimit) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedRateLimit(false);
                }}
                className="text-xs text-error font-bold flex items-center gap-1 hover:underline ml-2"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Opportunity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          {/* Main Gigs List */}
          <div className="lg:col-span-8 space-y-4">
            {filteredGigs.length > 0 ? (
              filteredGigs.map((gig) => {
                const isApplied = appliedGigIds.includes(gig.id);
                return (
                  <div key={gig.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 hover:border-[#0077B6]/30 hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0077B6] tracking-widest uppercase bg-[#0077B6]/5 px-2.5 py-1 rounded-md">{gig.type}</span>
                        <span className="text-xs font-bold text-teal-600 tracking-wider bg-teal-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> {gig.match} Match
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-slate-800 font-headline">{gig.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{gig.company} • {gig.location}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {gig.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                      <div className="mb-1 text-left sm:text-right">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Est. Compensation</span>
                        <span className="text-2xl font-extrabold text-[#0077B6] font-headline">{gig.rate}</span>
                      </div>
                      <button 
                        onClick={() => handleApply(gig.id, gig.title)}
                        disabled={isApplied || applyingGigId === gig.id}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-sm ${
                          isApplied 
                            ? 'bg-emerald-100 text-emerald-800 cursor-default flex items-center justify-center gap-1.5' 
                            : 'bg-gradient-to-br from-[#0077B6] to-[#014F86] text-white hover:scale-[1.01] active:scale-95'
                        }`}
                      >
                        {applyingGigId === gig.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : isApplied ? (
                          <>
                            <CheckCircle className="w-4 h-4" /> Applied
                          </>
                        ) : (
                          'File Credentials'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container-lowest p-12 text-center rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center shadow-xs">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                </div>
                <h4 className="font-bold text-xl mb-2 font-headline text-slate-800">No matching remote gigs found</h4>
                <p className="text-on-surface-variant max-w-sm mx-auto mb-6 text-sm leading-relaxed">We couldn't verify any active positions matching those criteria. Adjust your queries or clean up constraints.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('All');
                    setSelectedRateLimit(false);
                  }}
                  className="bg-[#0077B6]/10 text-[#0077B6] px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase hover:bg-[#0077B6]/20 transition-colors"
                >
                  Reset Settings
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar: Activity / Projections */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0077B6] mb-3">Market Reach Metrics</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">State Registry Scan</span>
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">compliant</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 w-[100%] rounded-full"></div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">Your state licensure parameters matched 12 verified consulting groups this morning.</p>
              </div>
            </div>

            <div className="bg-surface-container p-6 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Trending Skills</h4>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-white rounded-lg flex items-center gap-2 border border-slate-100 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0077B6]"></span>
                  <span className="text-xs font-bold text-slate-700">Invisalign</span>
                </div>
                <div className="px-3 py-1.5 bg-white rounded-lg flex items-center gap-2 border border-slate-100 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0077B6]"></span>
                  <span className="text-xs font-bold text-slate-700">Dental AI</span>
                </div>
                <div className="px-3 py-1.5 bg-white rounded-lg flex items-center gap-2 border border-slate-100 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0077B6]"></span>
                  <span className="text-xs font-bold text-slate-700">Remote Ortho</span>
                </div>
                <div className="px-3 py-1.5 bg-white rounded-lg flex items-center gap-2 border border-slate-100 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0077B6]"></span>
                  <span className="text-xs font-bold text-slate-700">Telediagnostic</span>
                </div>
              </div>
            </div>

            {/* Upgraded Consult Pro promo Card */}
            <div className="relative overflow-hidden rounded-xl bg-[#001D32] h-48 group shadow-lg">
              <img alt="Consulting" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9pgYMxzufi-afq7d2dPKd5_hv8xSLWqSnEj_DSwYT21vmrrwnXqa0CF4ufWQXUmhJ6TCSBV-kmcqTwPmAbSFS36IYsReSvYmnWUkhWS5ZUPmH7Tr13VWgffyI_dHbwvouPGp_pcqBx3gDZVxlzIeciBDIA3qX9MsR_L7W_futaLf36H9YqnRx3t-E-A9S3wu86KtYXspNXeq3D0wdplnIZk63gEhIhTmkawR61Jw8neW0EDOFaVg1r0mVw6rNhyOZj0ATIW98zvU" />
              <div className="relative h-full p-6 flex flex-col justify-end text-white">
                <h5 className="font-headline font-bold text-lg leading-tight mb-1">Upgrade to Consult Pro</h5>
                <p className="text-slate-300 text-xs mb-4">Priority access to high-value orthodontic consults with 24/7 client dispatch guarantees.</p>
                <Link to="/verification" className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:underline">
                  Unlock Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10 h-20 px-4 pb-safe flex justify-around items-center">
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400 font-inter text-[11px] font-semibold tracking-wide uppercase">
          <span className="material-symbols-outlined mb-1">dashboard</span>
          Dashboard
        </Link>
        <Link to="/opportunities" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1 font-inter text-[11px] font-semibold tracking-wide uppercase scale-110 duration-200">
          <span className="material-symbols-outlined mb-1">work_outline</span>
          Gigs
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center text-slate-400 font-inter text-[11px] font-semibold tracking-wide uppercase">
          <span className="material-symbols-outlined mb-1">account_balance_wallet</span>
          Wallet
        </Link>
        <Link to="/verification" className="flex flex-col items-center justify-center text-slate-400 font-inter text-[11px] font-semibold tracking-wide uppercase">
          <span className="material-symbols-outlined mb-1">person</span>
          Profile
        </Link>
      </nav>

      {/* FAB - Post New Gig */}
      <button 
        onClick={() => triggerToast('Gig posting is currently restricted to clinic account types.')}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 bg-gradient-to-br from-[#0077B6] to-[#014F86] text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
      >
        <span className="material-symbols-outlined">post_add</span>
      </button>
    </div>
  );
}
