import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Video, FileCheck2, Briefcase, Building2, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      {/* Navigation (3-Zone Contract) */}
      <nav className="fixed top-0 w-full z-50 bg-background/88 backdrop-blur-xl border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center gap-8">
          <BrandLogo to="/" size={32} />

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap shrink-0"
            >
              Capabilities
            </a>
            <a
              href="#pricing"
              className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap shrink-0"
            >
              Pricing
            </a>
            <Link
              to="/privacy"
              className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors whitespace-nowrap shrink-0"
            >
              Compliance
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <button
              onClick={onGetStarted}
              className="hidden sm:inline-flex text-on-surface-variant hover:text-on-surface font-semibold text-sm px-3.5 py-2 rounded-xl hover:bg-surface-container transition-colors whitespace-nowrap shrink-0"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              Start Earning
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden border-b border-outline-variant">
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2563EB] dark:text-blue-400 mb-6">
              Unified Clinical Workspace for Remote Dentists
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-headline text-on-surface mb-6 leading-[1.08] [text-wrap:balance]">
              Your All-in-One <span className="text-[#2563EB] dark:text-blue-400">Remote Career Hub</span>
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant mb-10 leading-relaxed max-w-2xl mx-auto">
              DentSide Remote unifies teledentistry consultations, insurance claims review, freelance gigs, and DSO contracts inside one structured dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Create Free Profile
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant px-7 py-3.5 rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <PlayCircle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                Explore Platform
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2563EB] dark:text-blue-400 mb-2">
              01 · Core Capabilities
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mb-4">
              Every Opportunity, One Login
            </h2>
            <p className="text-base text-on-surface-variant leading-relaxed">
              Built for licensed dentists and multi-location practices with structured triage, diagnostic review, and dual-rail payout ledgers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Video className="w-5 h-5" />}
              title="Teledentistry Hub"
              description="Triage acute dental emergencies, review high-contrast radiographs, and draft structured SOAP notes with clinical AI assistance."
            />
            <FeatureCard
              icon={<FileCheck2 className="w-5 h-5" />}
              title="Claims & AI Review"
              description="Evaluate prior authorizations, annotate CBCT and bitewing scans, and verify CDT coding for major dental insurers."
            />
            <FeatureCard
              icon={<Briefcase className="w-5 h-5" />}
              title="Freelance Marketplace"
              description="Discover remote dental writing, clear aligner staging, and consulting contracts calibrated to your state licensure."
            />
            <FeatureCard
              icon={<Building2 className="w-5 h-5" />}
              title="Practice Portal"
              description="Clinics and DSOs publish roles, review verified practitioner credentials, and track active case escrow in real time."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#2563EB] dark:text-blue-400 mb-2">
              02 · Membership Tiers
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base text-on-surface-variant">
              Start building your credentialed profile for free. Upgrade to Consult Pro when scaling your remote practice.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Base Tier */}
            <div className="bg-surface-container-lowest flex flex-col p-8 rounded-2xl border border-outline-variant">
              <div className="mb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  For Independent Practitioners
                </span>
                <h3 className="text-4xl font-extrabold font-headline mt-3 mb-2 tabular-nums">
                  $0<span className="text-base font-medium text-on-surface-variant">/mo</span>
                </h3>
                <p className="text-on-surface-variant text-sm">
                  Everything needed to launch your remote dental profile.
                </p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface-variant font-medium">Access to freelance & AI review gigs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface-variant font-medium">Credential & state license submission</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-on-surface-variant font-medium">Stripe Connect & M-Pesa wallet payouts</span>
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface py-3.5 px-5 rounded-xl text-sm font-semibold transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#111111] dark:bg-surface-container-lowest text-white p-8 rounded-2xl border border-[#2563EB] flex flex-col">
              <div className="mb-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Consult Pro · High-Volume Clinical Care
                </span>
                <h3 className="text-4xl font-extrabold font-headline mt-3 mb-2 tabular-nums">
                  $49<span className="text-base font-normal text-neutral-400">/mo</span>
                </h3>
                <p className="text-neutral-300 text-sm">
                  Priority routing and AI clinical decision support for full-time teledentistry.
                </p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-neutral-100">Priority matching for high-rate consults</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-neutral-100">0% marketplace commission</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-neutral-100">AI SOAP notes & CDT coding assistant</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-neutral-100">Expedited credential review</span>
                </li>
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 px-5 rounded-xl text-sm font-semibold transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-background py-10 border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <BrandLogo to={null} size={28} textClassName="text-base" suffix="Remote" />
          <p className="text-on-surface-variant text-sm text-center md:text-left">
            © 2026 DentSide Remote. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
              Terms
            </Link>
            <Link to="/privacy" className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
              Privacy
            </Link>
            <a
              href="mailto:support@dentsideremote.com"
              className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:border-[#2563EB]/50 transition-colors flex flex-col">
      <div className="w-10 h-10 rounded-xl bg-primary-fixed text-[#2563EB] dark:text-blue-400 flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-headline mb-2.5 text-on-surface">{title}</h3>
      <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
    </div>
  );
}
