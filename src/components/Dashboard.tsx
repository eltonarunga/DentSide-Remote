import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Loader2, Key, Sparkles, Filter, Calendar, Verified } from 'lucide-react';
import DentistLayout from './DentistLayout';

export default function Dashboard() {
  const { profile } = useAuth();
  
  // BYOK State - strictly memory bound 
  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  const handleAIMatch = async () => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key first.");
      return;
    }
    
    setIsMatching(true);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          profile: {
            experience: profile?.experience || "General Dental Practitioner",
            licenses: profile?.licenses || ["Pending License Review"],
            availability: profile?.availability || "Open",
            interests: profile?.interests || ["General Consulting", "Teledentistry"]
          }
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch matches');
      }
      
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <DentistLayout>
      {/* Hero Welcome & Availability */}
      <section className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <p className="text-primary font-semibold tracking-wider text-sm mb-2 uppercase">Precision Hospitality</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Welcome back, {profile?.displayName || 'Dr.'}</h1>
          <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed">Your clinical workspace is ready. You have 0 active consultations scheduled for today.</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 shadow-sm shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
            <span className="font-semibold text-on-surface">Available for Gigs</span>
          </div>
          <button className="relative inline-flex h-7 w-12 items-center rounded-full bg-primary-container">
            <span className="translate-x-6 inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm"></span>
          </button>
        </div>
      </section>

      {/* Bento Grid Stats & Earnings - gap-8 for uniform symmetric bento grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Earnings Card - p-8 internal padding */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-primary-fixed/80 font-medium mb-1">Total Earnings This Month</p>
                <h2 className="text-5xl font-extrabold tracking-tighter font-headline">$0.00</h2>
              </div>
              <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold">0% vs last month</span>
            </div>
            <div className="flex flex-wrap items-end gap-8">
              <div>
                <p className="text-primary-fixed/60 text-[10px] font-bold uppercase tracking-widest mb-1">Completed Gigs</p>
                <p className="text-2xl font-bold font-headline">0</p>
              </div>
              <div>
                <p className="text-primary-fixed/60 text-[10px] font-bold uppercase tracking-widest mb-1">Hours Logged</p>
                <p className="text-2xl font-bold font-headline">0h</p>
              </div>
              <div className="sm:ml-auto">
                <Link to="/wallet" className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-surface-container-low transition-all inline-block uppercase font-sans">Withdraw Funds</Link>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <span className="material-symbols-outlined text-[300px]">clinical_notes</span>
          </div>
        </div>

        {/* Profile Completion Card - p-8 internal padding */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm flex flex-col border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg font-headline">Verification</h3>
            <span className={`material-symbols-outlined ${profile?.onboardingComplete ? 'text-teal-600' : 'text-tertiary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="mb-auto">
            <div className="w-full bg-surface-container rounded-full h-2 mb-4">
              <div className={`${profile?.onboardingComplete ? 'bg-teal-600 w-full' : 'bg-tertiary-container w-[40%]'} h-2 rounded-full`}></div>
            </div>
            {profile?.onboardingComplete ? (
              <p className="text-sm text-on-surface-variant leading-relaxed">Your credentials are <span className="font-bold text-teal-600">100% Verified</span>. Clinical Pro unlocked.</p>
            ) : (
              <p className="text-sm text-on-surface-variant leading-relaxed">Your clinical credentials are <span className="font-bold text-on-surface">40% complete</span>. Add your license to unlock gigs.</p>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/profile-builder" className="w-full py-2.5 bg-[#0077B6] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#0077B6]/90 transition-colors text-center block shadow-xs">
              {profile?.profileCompleted ? 'EDIT QUALIFICATIONS' : 'BUILD QUALIFICATIONS'}
            </Link>
            <Link to="/verification" className="w-full py-2.5 outline outline-outline-variant/30 rounded-xl text-primary font-bold text-xs uppercase tracking-wider hover:bg-surface-container transition-colors text-center block">
              {profile?.onboardingComplete ? 'VIEW LICENSE' : 'VERIFY LICENSE'}
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Gigs */}
        <div className="lg:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight font-headline">Active Gigs</h2>
            <Link to="/opportunities" className="text-primary font-semibold text-sm hover:underline">View All Schedule</Link>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-lowest p-8 text-center rounded-2xl shadow-sm border border-dashed border-outline-variant">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg mb-1 font-headline">No Active Gigs</h4>
              <p className="text-on-surface-variant text-sm">You don't have any active gigs scheduled for today.</p>
            </div>
          </div>
        </div>

        {/* Recommended Opportunities & AI Matchmaker */}
        <div className="lg:col-span-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight font-headline">AI Matchmaker</h2>
            <button className="p-2 rounded-full hover:bg-surface-container text-slate-400">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20">
              <Key className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="password"
                placeholder="Enter Gemini API Key"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="bg-transparent border-none text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0 flex-1"
              />
              <button
                onClick={handleAIMatch}
                disabled={isMatching || !apiKey}
                className="bg-primary hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant text-on-primary px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shrink-0"
              >
                {isMatching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find Gigs'}
              </button>
            </div>

            {matches.length > 0 ? (
              matches.map((match, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-5 rounded-xl border border-transparent hover:border-primary/20 transition-all cursor-pointer shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-bold font-headline text-slate-800">{match.title}</h5>
                    <span className="text-primary font-bold text-sm shrink-0 ml-2">{match.rate}</span>
                  </div>
                  <p className="text-on-surface-variant text-xs mb-4">{match.company} • <span className="text-teal-600 font-bold">{match.match} Match</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.tags.map((tag: string, i: number) => (
                      <span key={i} className="bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold uppercase">{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 animate-pulse">
                  <Sparkles className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-on-surface-variant">Enter your API key to get personalized gig recommendations.</p>
              </div>
            )}

            <Link to="/opportunities" className="block text-center w-full py-3.5 bg-[#0077B6]/10 hover:bg-[#0077B6]/20 text-[#0077B6] font-bold text-xs tracking-widest uppercase transition-colors rounded-xl">EXPLORE ALL GIGS</Link>
          </div>
        </div>
      </div>
    </DentistLayout>
  );
}
