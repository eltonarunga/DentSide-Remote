import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Loader2,
  CheckCircle,
  Search,
  Sparkles,
  X,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLogo } from '../components/BrandLogo';

interface Gig {
  id: string;
  title: string;
  company: string;
  type: string;
  rate: string;
  rateNum: number;
  location: string;
  tags: string[];
  matchScore?: string;
  match?: string;
  matchRationale?: string;
  description?: string;
  requirements?: string[];
  applicantsCount?: number;
}

export default function OpportunityEngine() {
  const { user, profile, apiFetch } = useAuth();

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRateLimit, setSelectedRateLimit] = useState<boolean>(false);
  const [appliedGigIds, setAppliedGigIds] = useState<string[]>([]);
  const [applyingGigId, setApplyingGigId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiMatching, setIsAiMatching] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchGigsAndApplications = useCallback(async () => {
    try {
      setLoading(true);
      const gigsPromise = fetch('/api/gigs');
      const appliedPromise = user?.uid
        ? apiFetch(`/api/gigs/applied/${user.uid}`)
        : Promise.resolve(null);

      const [gigsRes, appliedRes] = await Promise.all([gigsPromise, appliedPromise]);

      if (gigsRes.ok) {
        const data: Gig[] = await gigsRes.json();
        setGigs(data);
      }

      if (appliedRes && appliedRes.ok) {
        const apps: Array<{ gigId: string }> = await appliedRes.json();
        setAppliedGigIds(apps.map((a) => a.gigId));
      }
    } catch (err) {
      console.error('Error loading gigs:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, user?.uid]);

  useEffect(() => {
    fetchGigsAndApplications();
  }, [fetchGigsAndApplications]);

  const handleRunAiMatching = async () => {
    setIsAiMatching(true);
    try {
      const res = await apiFetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            displayName: profile?.displayName,
            degree: profile?.degree || 'DDS, UCSF School of Dentistry',
            institution: profile?.institution,
            experience: profile?.experience,
            specialty: profile?.specialty || 'General Dentistry',
            subSpecialties: profile?.subSpecialties || [],
            licenseState: profile?.licenseState || 'California',
            availability: profile?.availability,
            bio:
              profile?.bio ||
              'Experienced in clear aligner treatment, teledentistry, and AI radiograph reviews.',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not calibrate AI matching.');
      }

      const matches = Array.isArray(data.matches) ? data.matches : Array.isArray(data) ? data : [];
      if (matches.length > 0) {
        const matchMap = new Map<string, { score: string; rationale?: string }>(
          matches.map((m: any) => [
            m.gigId || m.title,
            { score: m.match || `${m.matchScore}%`, rationale: m.rationale },
          ])
        );

        setGigs((prev) =>
          prev.map((g) => {
            const found = matchMap.get(g.id) || matchMap.get(g.title);
            return found
              ? { ...g, match: found.score, matchRationale: found.rationale }
              : g;
          })
        );
        triggerToast('AI Match scores dynamically calibrated to your dental license & skills!');
      }
    } catch (err: any) {
      console.error('AI match error:', err);
      triggerToast(err.message || 'Could not calibrate AI matching.');
    } finally {
      setIsAiMatching(false);
    }
  };

  const handleApply = async (gigId: string, title: string) => {
    if (!profile?.onboardingComplete) {
      triggerToast('Verification required. Please verify your license first!');
      return;
    }
    setApplyingGigId(gigId);
    try {
      const res = await apiFetch(`/api/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistName: profile?.displayName || 'Dr. Sarah Jenkins, DDS',
          dentistDegree: profile?.degree || 'DDS',
          specialty: profile?.specialty || 'General Dentistry',
          licenseNumber: profile?.licenseNumber || 'PENDING',
          licenseState: profile?.licenseState || 'California',
          coverNote:
            'I would love to support your teledentistry and clinical review operations.',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to apply');
      }

      setAppliedGigIds((prev) => [...prev, gigId]);
      triggerToast(`Application submitted to: ${title}!`);
      fetchGigsAndApplications();
    } catch (err: any) {
      triggerToast(err.message || 'Unable to file application. Please retry.');
    } finally {
      setApplyingGigId(null);
    }
  };

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const matchesSearch =
        gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gig.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gig.tags && gig.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesType = selectedType === 'All' || gig.type === selectedType;
      const matchesRate = !selectedRateLimit || (gig.rateNum && gig.rateNum >= 100);

      return matchesSearch && matchesType && matchesRate;
    });
  }, [gigs, searchQuery, selectedType, selectedRateLimit]);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen pb-24 md:pb-12 relative animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in">
          <span className="material-symbols-outlined text-[#2563EB] dark:text-blue-400">info</span>
          <p className="text-xs font-semibold tracking-tight">{toastMessage}</p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/88 backdrop-blur-xl border-b border-outline-variant h-16 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BrandLogo to="/dashboard" size={30} />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link
            to="/opportunities"
            className="text-[#2563EB] dark:text-blue-400 font-semibold text-sm transition-colors whitespace-nowrap"
          >
            Gigs
          </Link>
          <Link
            to="/consultations"
            className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> Teledentistry
          </Link>
          <Link
            to="/wallet"
            className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap"
          >
            Wallet
          </Link>
          <Link
            to="/profile-builder"
            className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap"
          >
            Qualifications
          </Link>
          <Link
            to="/verification"
            className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap"
          >
            Verify License
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={handleRunAiMatching}
            disabled={isAiMatching}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-primary-fixed text-[#2563EB] dark:text-blue-400 rounded-xl text-xs font-semibold border border-[#2563EB]/25 hover:bg-[#2563EB] hover:text-white transition-colors"
          >
            {isAiMatching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            AI Smart Match
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
            <img
              alt="User avatar"
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
            />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {!profile?.onboardingComplete && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-on-surface rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">
                warning
              </span>
              <div>
                <p className="font-bold text-sm">Credentials Unverified</p>
                <p className="text-xs text-on-surface-variant">
                  Verify your board credentials to activate applications on remote clinical gigs.
                </p>
              </div>
            </div>
            <Link
              to="/verification"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
            >
              Verify Now
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 mb-2">
              Remote Marketplace
            </p>
            <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">
              Opportunity Engine
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl leading-relaxed">
              Filter, match, and apply to state-compliant clinical advisor roles and corporate teledentistry programs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchGigsAndApplications}
              className="p-2.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface rounded-xl transition-colors"
              title="Refresh gigs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/consultations"
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Stethoscope className="w-4 h-4" /> Teledentistry Hub
            </Link>
          </div>
        </div>

        {/* Dynamic Filter Section */}
        <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-on-surface-variant rounded-xl pl-10 pr-4 h-11 text-sm focus:ring-2 focus:ring-[#2563EB] outline-none"
              placeholder="Search by role, company, or specialization..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-surface-container-lowest px-4 h-11 rounded-xl cursor-pointer border border-outline-variant text-sm font-semibold text-on-surface focus:ring-2 focus:ring-[#2563EB] outline-none"
            >
              <option value="All">All Types</option>
              <option value="Teledentistry">Teledentistry</option>
              <option value="Freelance">Freelance</option>
              <option value="Insurance">Insurance</option>
              <option value="AI Review">AI Review</option>
            </select>

            <button
              onClick={() => setSelectedRateLimit((prev) => !prev)}
              className={`px-4 h-11 flex items-center gap-2 rounded-xl cursor-pointer transition-colors text-sm font-semibold border ${
                selectedRateLimit
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-base">payments</span>
              <span>$100+/hr Only</span>
            </button>

            {(searchQuery || selectedType !== 'All' || selectedRateLimit) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedRateLimit(false);
                }}
                className="text-xs text-error font-semibold flex items-center gap-1 hover:underline ml-1"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Opportunity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="bg-surface-container-lowest p-12 text-center rounded-2xl border border-outline-variant">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant">Loading live opportunities...</p>
              </div>
            ) : filteredGigs.length > 0 ? (
              filteredGigs.map((gig) => {
                const isApplied = appliedGigIds.includes(gig.id);
                return (
                  <div
                    key={gig.id}
                    className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-[#2563EB]/60 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
                          {gig.type}
                        </span>
                        <span className="text-on-surface-variant" aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 tabular-nums">
                          <Sparkles className="w-3.5 h-3.5" />
                          {gig.match || gig.matchScore || '92%'} Match
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-on-surface font-headline">{gig.title}</h3>
                      <p className="text-sm text-on-surface-variant font-medium">
                        {gig.company} · {gig.location}
                      </p>
                      {gig.description && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 max-w-xl leading-relaxed">
                          {gig.description}
                        </p>
                      )}
                      {gig.matchRationale && (
                        <p className="text-xs text-[#2563EB] dark:text-blue-300 font-medium bg-primary-fixed px-3 py-1.5 rounded-lg">
                          AI Match: {gig.matchRationale}
                        </p>
                      )}
                      {gig.tags && gig.tags.length > 0 && (
                        <p className="text-[11px] font-medium text-on-surface-variant pt-1">
                          {gig.tags.join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-stretch sm:items-end gap-2.5 w-full sm:w-auto shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider block">
                          Compensation
                        </span>
                        <span className="text-2xl font-extrabold text-on-surface font-headline tabular-nums">
                          {gig.rate}
                        </span>
                      </div>
                      <button
                        onClick={() => handleApply(gig.id, gig.title)}
                        disabled={isApplied || applyingGigId === gig.id}
                        className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors ${
                          isApplied
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 cursor-default flex items-center justify-center gap-1.5'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
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
              <div className="bg-surface-container-lowest p-12 text-center rounded-2xl border border-dashed border-outline-variant flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h4 className="font-bold text-xl mb-2 font-headline text-on-surface">
                  No matching remote gigs found
                </h4>
                <p className="text-on-surface-variant max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                  No active positions matched those criteria. Adjust your search terms or reset filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('All');
                    setSelectedRateLimit(false);
                  }}
                  className="bg-primary-fixed text-[#2563EB] dark:text-blue-400 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#2563EB] hover:text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 mb-3">
                Market Reach Metrics
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-on-surface">State Registry Scan</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                    Compliant
                  </span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] w-full rounded-full" />
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your state licensure parameters matched{' '}
                  <span className="font-semibold text-on-surface tabular-nums">{gigs.length}</span> verified consulting groups.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-4">
                Trending Focus Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Invisalign', 'Dental AI', 'Remote Ortho', 'Telediagnostic'].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSearchQuery(skill)}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-on-surface transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#111111] dark:bg-surface-container-lowest border border-[#27272A] p-6 text-white">
              <h5 className="font-headline font-bold text-lg leading-tight mb-1.5">
                Teledentistry Clinical Hub
              </h5>
              <p className="text-neutral-300 text-xs mb-5 leading-relaxed">
                Direct access to patient triage cases, digital intraoral scans, and AI SOAP diagnostics.
              </p>
              <Link
                to="/consultations"
                className="text-blue-400 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 hover:underline"
              >
                Launch Clinical Hub
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-outline-variant h-16 px-4 flex justify-around items-center">
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center text-on-surface-variant text-[10px] font-medium"
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          Dashboard
        </Link>
        <Link
          to="/opportunities"
          className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400 text-[10px] font-semibold"
        >
          <span className="material-symbols-outlined text-xl">work_outline</span>
          Gigs
        </Link>
        <Link
          to="/consultations"
          className="flex flex-col items-center justify-center text-on-surface-variant text-[10px] font-medium"
        >
          <Stethoscope className="w-5 h-5" />
          Consults
        </Link>
        <Link
          to="/wallet"
          className="flex flex-col items-center justify-center text-on-surface-variant text-[10px] font-medium"
        >
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
          Wallet
        </Link>
      </nav>
    </div>
  );
}
