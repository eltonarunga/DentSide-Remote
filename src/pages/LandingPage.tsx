import React from 'react';
import BrandMark from '../components/BrandMark';
import SiteFooter from '../components/SiteFooter';

interface LandingProps {
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { label: 'Marketplace', href: '#features' },
  { label: 'For Clinicians', href: '#pricing' },
  { label: 'About', href: '#about' },
];

const FEATURES = [
  {
    icon: 'video_chat',
    title: 'Teledentistry',
    desc: 'HIPAA-compliant async & live video. 5–30 min triage sessions. No scheduling software required.',
    color: 'text-primary bg-primary-fixed',
  },
  {
    icon: 'clinical_notes',
    title: 'Claims Vault',
    desc: 'Review records remotely for major insurers. Submit expert opinions and prior auth documentation.',
    color: 'text-secondary bg-secondary-fixed',
  },
  {
    icon: 'psychology',
    title: 'Freelance Gigs',
    desc: 'Dental writing, tutoring, consulting. Post services or bid on projects from clinics globally.',
    color: 'text-tertiary bg-tertiary-fixed',
  },
  {
    icon: 'groups',
    title: 'Corporate Roles',
    desc: 'Curated remote openings at DSOs and healthtech. One-click apply with your verified profile.',
    color: 'text-primary bg-primary-fixed-dim',
  },
];

const TICKER_ITEMS = [
  'Teledentistry → $85/hr', 'Insurance Review → $120/hr',
  'Academic Writing', 'Case Consultation', 'Remote DSO Roles',
  'Global Payouts', 'AI Matchmaker', 'License Verification',
];

export default function LandingPage({ onGetStarted }: LandingProps) {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <nav className="fixed top-0 left-0 right-0 h-20 z-50 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl">
        <div className="page-shell page-padding flex h-20 items-center justify-between">
          <BrandMark size={32} />

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onGetStarted} className="hidden sm:block text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
              Log in
            </button>
            <button onClick={onGetStarted} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="page-shell page-padding pt-28 md:pt-34 pb-14 md:pb-18">
        <div className="rounded-[2.25rem] border border-primary/15 bg-gradient-to-br from-primary-fixed/35 via-surface-container-lowest to-surface px-6 py-10 md:px-12 md:py-14 lg:px-16 lg:py-16 shadow-[0_30px_80px_rgba(0,93,144,0.12)]">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-fixed/40 px-4 py-2 mb-8">
                <span className="material-symbols-outlined text-primary text-sm">verified</span>
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">The Premier Remote Dental Network</span>
              </div>
              <h1 className="font-headline text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                The future of <span className="text-primary italic">clinical work.</span>
              </h1>
              <p className="text-lg text-on-surface-variant font-medium max-w-2xl mb-10 leading-relaxed">
                DentSide Remote connects elite dental professionals with high-value teledentistry,
                insurance review, and consulting roles in one precision hub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={onGetStarted} className="bg-primary text-on-primary px-7 py-4 rounded-2xl font-black text-base shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Join the Network
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <a href="#features" className="bg-surface-container-high text-on-surface px-7 py-4 rounded-2xl font-bold text-base hover:bg-surface-container-highest transition-colors flex items-center justify-center">
                  Explore Gigs
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              {[['4.9/5', 'Clinician Satisfaction'], ['140+', 'Active Gig Types'], ['48h', 'Avg. Verification Time'], ['24/7', 'Global Opportunity Flow']].map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white/90 border border-outline-variant/30 p-5">
                  <p className="font-headline text-3xl font-black text-primary">{value}</p>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="bg-surface-container-low border-y border-outline-variant/20 py-4 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <React.Fragment key={i}>
              <span className="text-xs font-bold text-outline-variant uppercase tracking-widest px-8">{item}</span>
              <span className="text-outline-variant">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section id="features" className="page-shell page-padding py-16 md:py-24" >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">
          <div id="about" className="sticky top-26 rounded-3xl bg-surface-container-low/60 p-6 md:p-8 border border-outline-variant/15">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-5 block">Precision Platform</span>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Every opportunity, one unified login.</h2>
            <p className="text-lg text-on-surface-variant font-medium leading-relaxed mb-8">
              Built by clinicians, for clinicians. Manage credentials, earnings, and gig workflows without switching platforms.
            </p>
            <button onClick={onGetStarted} className="text-primary font-black flex items-center gap-3 group text-lg">
              Learn about our verification process
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface-container-lowest p-7 rounded-3xl editorial-shadow border border-outline-variant/10 hover:border-primary/25 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <span className="material-symbols-outlined text-xl">{f.icon}</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-inverse-surface py-18 md:py-24 page-padding">
        <div className="page-shell text-center mb-14">
          <span className="text-primary-fixed-dim font-bold tracking-widest text-xs uppercase mb-4 block">Membership</span>
          <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white tracking-tight">Start free. Scale when ready.</h2>
        </div>

        <div className="page-shell max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col text-white">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Clinician Profile</span>
            <div className="font-headline text-5xl font-black mb-3">Free</div>
            <p className="text-white/60 font-medium mb-8">Everything you need to start earning remotely.</p>
            <div className="space-y-3 mb-10 flex-1">{['Access to all freelance gigs', 'Standard identity verification', 'Global wallet & withdrawals', 'AI Matchmaker (BYOK)'].map((item) => <div key={item} className="flex items-center gap-3"><span className="material-symbols-outlined text-primary-fixed text-lg">check_circle</span><span className="text-sm font-medium text-white/80">{item}</span></div>)}</div>
            <button onClick={onGetStarted} className="w-full py-3.5 rounded-xl border border-white/20 font-bold text-white hover:bg-white/10 transition-colors">Get Started</button>
          </div>

          <div className="bg-primary-container rounded-[2rem] p-8 flex flex-col text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <span className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-5">Consult Pro</span>
            <div className="font-headline text-5xl font-black mb-3 flex items-baseline">$49<span className="text-lg font-medium opacity-60 ml-2">/mo</span></div>
            <p className="text-on-primary-container font-medium mb-8">The complete toolkit for dental pioneers.</p>
            <div className="space-y-3 mb-10 flex-1">{['Priority gig matching', '0% platform commission', 'Expedited credential review', 'Premium support 24/7', 'Guaranteed daily rate access'].map((item) => <div key={item} className="flex items-center gap-3"><span className="material-symbols-outlined text-white text-lg">verified</span><span className="text-sm font-black text-white">{item}</span></div>)}</div>
            <button onClick={onGetStarted} className="w-full py-3.5 rounded-xl bg-white text-primary font-black text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Upgrade to Pro</button>
          </div>
        </div>
      </section>

      <SiteFooter className="bg-surface border-none" />

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}</style>
    </div>
  );
}
