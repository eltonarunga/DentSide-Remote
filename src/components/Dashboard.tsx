import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';

interface AiMatchResult {
  gigId?: string;
  title: string;
  company: string;
  type: string;
  rate: string;
  match: string;
  tags: string[];
  rationale?: string;
}

interface ActiveConsultation {
  id: string;
  patientName: string;
  caseType: string;
  urgency: string;
  status: string;
  fee: number;
}

export default function Dashboard() {
  const { user, profile, logout, updateProfile, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<AiMatchResult[]>([]);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [balance, setBalance] = useState<number>(0);
  const [completedConsults, setCompletedConsults] = useState<number>(0);
  const [activeConsults, setActiveConsults] = useState<ActiveConsultation[]>([]);
  const [appliedCount, setAppliedCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  const isAvailable = profile?.availableForGigs ?? true;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadDashboardMetrics = useCallback(async () => {
    if (!user?.uid) return;
    setStatsLoading(true);
    try {
      const [walletRes, consultsRes, appliedRes] = await Promise.all([
        apiFetch(`/api/wallet/${user.uid}`),
        apiFetch('/api/consultations'),
        apiFetch(`/api/gigs/applied/${user.uid}`),
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setBalance(typeof walletData.balance === 'number' ? walletData.balance : 0);
      }
      if (consultsRes.ok) {
        const consultsData: ActiveConsultation[] = await consultsRes.json();
        setCompletedConsults(consultsData.filter((c) => c.status === 'Completed').length);
        setActiveConsults(consultsData.filter((c) => c.status !== 'Completed'));
      }
      if (appliedRes.ok) {
        const appliedData = await appliedRes.json();
        setAppliedCount(Array.isArray(appliedData) ? appliedData.length : 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [apiFetch, user?.uid]);

  useEffect(() => {
    loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  const handleToggleAvailability = async () => {
    try {
      const next = !isAvailable;
      await updateProfile({ availableForGigs: next });
      showToast(next ? 'Status updated: Available for remote gigs' : 'Status updated: Paused');
    } catch {
      showToast('Could not update availability status.');
    }
  };

  const handleAIMatch = async () => {
    setIsMatching(true);
    setMatchError(null);
    try {
      const response = await apiFetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            displayName: profile?.displayName,
            degree: profile?.degree,
            institution: profile?.institution,
            experience: profile?.experience || 'General Dental Practitioner',
            specialty: profile?.specialty || 'General Dentistry',
            subSpecialties: profile?.subSpecialties || [],
            licenseState: profile?.licenseState || 'California',
            licenses: profile?.licenses || (profile?.licenseNumber ? [profile.licenseNumber] : []),
            availability: profile?.availability || 'Open',
            interests: profile?.interests || ['General Consulting', 'Teledentistry'],
            bio: profile?.bio,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch AI matches');
      }

      const list = Array.isArray(data.matches) ? data.matches : Array.isArray(data) ? data : [];
      setMatches(list);
      if (list.length > 0) {
        showToast(`Found ${list.length} personalized AI gig matches!`);
      }
    } catch (error: any) {
      setMatchError(error.message || 'Unable to reach AI Matchmaker.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="text-on-surface bg-background min-h-screen font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <p className="text-xs font-semibold tracking-tight">{toastMessage}</p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/88 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <BrandLogo to="/dashboard" size={30} />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#2563EB] dark:text-blue-400 whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link
            to="/opportunities"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Gigs
          </Link>
          <Link
            to="/consultations"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Teledentistry
          </Link>
          <Link
            to="/wallet"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Wallet
          </Link>
          <Link
            to="/profile-builder"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Qualifications
          </Link>
          <Link
            to="/verification"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Verify License
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors text-xs font-semibold text-on-surface-variant hover:text-error"
          >
            Logout
          </button>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant">
            <img
              alt="User avatar"
              className="w-full h-full object-cover"
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
            />
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero Welcome & Availability */}
        <section className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-[#2563EB] dark:text-blue-400 font-semibold tracking-wider text-xs mb-2 uppercase">
              Clinical Overview
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
              Welcome back, {profile?.displayName || 'Dr.'}
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg max-w-lg leading-relaxed">
              Your clinical workspace is ready. You have{' '}
              <span className="font-semibold text-on-surface tabular-nums">{activeConsults.length}</span> active{' '}
              {activeConsults.length === 1 ? 'consultation' : 'consultations'} in the teledentistry queue.
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-2xl flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Availability
              </span>
              <span className="font-semibold text-sm text-on-surface">
                {isAvailable ? 'Available for Gigs' : 'Availability Paused'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAvailability}
              aria-label="Toggle gig availability"
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isAvailable ? 'bg-[#2563EB]' : 'bg-surface-container-high'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition shadow-xs ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Bento Grid Stats & Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Earnings Card */}
          <div className="md:col-span-2 bg-[#111111] dark:bg-surface-container-lowest rounded-2xl p-8 text-white relative overflow-hidden border border-[#27272A]">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10 gap-4">
                <div>
                  <p className="text-neutral-400 text-sm font-medium mb-1">Available Wallet Balance</p>
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline tabular-nums">
                    {statsLoading ? '...' : `$${balance.toFixed(2)}`}
                  </h2>
                </div>
                <span className="text-xs font-semibold text-blue-300 tabular-nums">
                  {appliedCount} Applied {appliedCount === 1 ? 'Gig' : 'Gigs'}
                </span>
              </div>
              <div className="flex flex-wrap gap-8 items-center">
                <div>
                  <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Completed Consults
                  </p>
                  <p className="text-2xl font-bold font-headline tabular-nums">{completedConsults}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Queue Pending
                  </p>
                  <p className="text-2xl font-bold font-headline tabular-nums">{activeConsults.length}</p>
                </div>
                <div className="ml-auto">
                  <Link
                    to="/wallet"
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors inline-block"
                  >
                    Withdraw Funds
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 flex flex-col border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg font-headline text-on-surface">Verification</h3>
              <span
                className={`material-symbols-outlined ${
                  profile?.onboardingComplete
                    ? 'text-[#2563EB] dark:text-blue-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <div className="mb-auto">
              <div className="w-full bg-surface-container rounded-full h-2 mb-4">
                <div
                  className={`${
                    profile?.onboardingComplete
                      ? 'bg-[#2563EB] w-full'
                      : 'bg-amber-500 w-[40%]'
                  } h-2 rounded-full transition-all`}
                />
              </div>
              {profile?.onboardingComplete ? (
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Your credentials are{' '}
                  <span className="font-semibold text-[#2563EB] dark:text-blue-400">100% Verified</span>. Clinical Pro unlocked.
                </p>
              ) : (
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Your clinical credentials are{' '}
                  <span className="font-semibold text-on-surface">40% complete</span>. Add your license to unlock gigs.
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to="/profile-builder"
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors text-center block"
              >
                {profile?.profileCompleted ? 'Edit Qualifications' : 'Build Qualifications'}
              </Link>
              <Link
                to="/verification"
                className="w-full py-2.5 border border-outline-variant rounded-xl text-on-surface font-semibold text-xs uppercase tracking-wider hover:bg-surface-container transition-colors text-center block"
              >
                {profile?.onboardingComplete ? 'View License' : 'Verify License'}
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Active Teledentistry Queue */}
          <div className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight font-headline text-on-surface">
                Active Teledentistry Queue
              </h2>
              <Link
                to="/consultations"
                className="text-[#2563EB] dark:text-blue-400 font-semibold text-sm hover:underline"
              >
                Open Consultations Hub
              </Link>
            </div>
            <div className="space-y-3">
              {activeConsults.length > 0 ? (
                activeConsults.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate('/consultations')}
                    className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant hover:border-[#2563EB]/60 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h4 className="font-bold text-base font-headline text-on-surface">
                          {c.patientName}
                        </h4>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            c.urgency === 'Emergency'
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : c.urgency === 'Urgent'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {c.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {c.caseType} · {c.status}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                      +${c.fee}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-surface-container-lowest p-8 text-center rounded-2xl border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                    event_busy
                  </span>
                  <h4 className="font-bold text-lg mb-1 font-headline text-on-surface">
                    No Pending Consultations
                  </h4>
                  <p className="text-on-surface-variant text-sm">
                    Browse the Opportunity Engine to pick up new remote clinical work.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Opportunities & AI Matchmaker */}
          <div className="lg:col-span-5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight font-headline text-on-surface">
                AI Matchmaker
              </h2>
              <button
                onClick={handleAIMatch}
                disabled={isMatching}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                {isMatching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isMatching ? 'Matching...' : 'Find Best Gigs'}
              </button>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 space-y-3">
              {matchError && (
                <div className="bg-error-container border border-error/30 text-error p-3 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{matchError}</span>
                </div>
              )}

              {matches.length > 0 ? (
                matches.map((match, idx) => (
                  <div
                    key={match.gigId || idx}
                    onClick={() => navigate('/opportunities')}
                    className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant hover:border-[#2563EB]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h5 className="font-bold font-headline text-on-surface">{match.title}</h5>
                      <span className="text-[#2563EB] dark:text-blue-400 font-bold text-sm tabular-nums shrink-0">
                        {match.rate}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-xs mb-2">
                      {match.company} · {match.match} Match
                    </p>
                    {match.rationale && (
                      <p className="text-xs text-on-surface-variant mb-2.5 line-clamp-2">
                        {match.rationale}
                      </p>
                    )}
                    {match.tags && match.tags.length > 0 && (
                      <p className="text-[11px] font-medium text-on-surface-variant">
                        {match.tags.join(' · ')}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">
                    auto_awesome
                  </span>
                  <p className="text-sm text-on-surface-variant">
                    Click <strong className="text-on-surface">Find Best Gigs</strong> to analyze your dental credentials with Gemini AI and rank top remote roles.
                  </p>
                </div>
              )}

              <Link
                to="/opportunities"
                className="block text-center w-full py-3.5 text-[#2563EB] dark:text-blue-400 font-semibold text-xs tracking-wider uppercase hover:bg-surface-container transition-colors rounded-xl"
              >
                Explore All Gigs
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-outline-variant flex justify-around items-center px-4 h-16">
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400"
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[10px] font-semibold mt-0.5">Dashboard</span>
        </Link>
        <Link
          to="/opportunities"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">work_outline</span>
          <span className="text-[10px] font-medium mt-0.5">Gigs</span>
        </Link>
        <Link
          to="/consultations"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">medical_services</span>
          <span className="text-[10px] font-medium mt-0.5">Consults</span>
        </Link>
        <Link
          to="/wallet"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
          <span className="text-[10px] font-medium mt-0.5">Wallet</span>
        </Link>
      </nav>
    </div>
  );
}
