import React from 'react';
import BrandMark from '../components/BrandMark';
import SiteFooter from '../components/SiteFooter';

interface LandingProps {
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { label: 'Marketplace', href: '#features' },
  { label: 'For Clinicians', href: '#pricing' },
  { label: 'About', href: '#' },
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
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 h-20 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-8 flex items-center justify-between">
        <BrandMark size={32} />

        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onGetStarted}
            className="hidden sm:block text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            Log in
          </button>
          <button
            onClick={onGetStarted}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-48 pb-32 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary/10 rounded-full px-6 py-2 mb-12 shadow-sm">
          <span className="material-symbols-outlined text-primary text-sm">verified</span>
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            The Premier Remote Dental Network
          </span>
        </div>

        <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black text-on-surface tracking-tighter leading-[1.05] mb-10">
          The future of <br />
          <span className="text-primary italic">clinical work.</span>
        </h1>

        <p className="text-lg md:text-xl text-on-surface-variant font-medium max-w-3xl mb-16 leading-relaxed">
          Stop juggling platforms. DentSide Remote connects elite dental professionals with
          high-value teledentistry, insurance review, and clinical consulting roles — all in one precision hub.
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={onGetStarted}
            className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-black text-lg tracking-wide uppercase shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center gap-3"
          >
            Join the Network
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <a
            href="#features"
            className="bg-surface-container-high text-on-surface px-10 py-5 rounded-2xl font-bold text-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center"
          >
            Explore Gigs
          </a>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="bg-surface-container-low border-y border-outline-variant/20 py-6 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <React.Fragment key={i}>
              <span className="text-xs font-bold text-outline-variant uppercase tracking-widest px-10">
                {item}
              </span>
              <span className="text-outline-variant">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-48 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-6 block">
              Precision Platform
            </span>
            <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-on-surface tracking-tight mb-10">
              Every opportunity,<br />one unified login.
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant font-medium leading-relaxed mb-12">
              Built by clinicians, for clinicians. We've eliminated the friction of remote dental work,
              providing a single dashboard for credentials, earnings, and gig management.
            </p>
            <button
              onClick={onGetStarted}
              className="text-primary font-black flex items-center gap-3 group text-lg"
            >
              Learn about our verification process
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
                arrow_forward
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface-container-lowest p-8 rounded-3xl editorial-shadow border border-transparent hover:border-primary/10 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.color}`}>
                  <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="bg-inverse-surface py-48 px-8">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <span className="text-primary-fixed-dim font-bold tracking-widest text-xs uppercase mb-6 block">
            Membership
          </span>
          <h2 className="font-headline text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Start free. Scale when ready.
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 flex flex-col text-white">
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">
              Clinician Profile
            </span>
            <div className="font-headline text-6xl font-black mb-4">Free</div>
            <p className="text-white/60 font-medium mb-10">
              Everything you need to start earning remotely.
            </p>

            <div className="space-y-4 mb-12 flex-1">
              {[
                'Access to all freelance gigs',
                'Standard identity verification',
                'Global wallet & withdrawals',
                'AI Matchmaker (BYOK)',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-fixed text-lg">check_circle</span>
                  <span className="text-sm font-medium text-white/80">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 rounded-2xl border border-white/20 font-bold text-white hover:bg-white/10 transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Pro */}
          <div className="bg-primary-container rounded-[2.5rem] p-10 flex flex-col text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <span className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-6">
              Consult Pro
            </span>
            <div className="font-headline text-6xl font-black mb-4 flex items-baseline">
              $49<span className="text-xl font-medium opacity-60 ml-2">/mo</span>
            </div>
            <p className="text-on-primary-container font-medium mb-10">
              The complete toolkit for dental pioneers.
            </p>

            <div className="space-y-4 mb-12 flex-1">
              {[
                'Priority gig matching',
                '0% platform commission',
                'Expedited credential review',
                'Premium support 24/7',
                'Guaranteed daily rate access',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white text-lg">verified</span>
                  <span className="text-sm font-black text-white">{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className="w-full py-4 rounded-2xl bg-white text-primary font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>

      {/* ── Visual Footer ── */}
      <div className="bg-surface overflow-hidden py-32 border-b border-outline-variant/10">
        <div className="animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="inline-block">
               {['TELEDENTISTRY', 'CLAIMS REVIEW', 'GIGS', 'REMOTE WORK'].map((text) => (
                 <span key={text} className="font-headline text-[12vw] font-black text-transparent stroke-outline-variant stroke-1 px-10 opacity-20">
                   {text}
                 </span>
               ))}
            </div>
          ))}
        </div>
      </div>

      <SiteFooter className="bg-surface border-none" />

      <style>{`
        .stroke-outline-variant {
          -webkit-text-stroke: 2px var(--outline-variant);
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
