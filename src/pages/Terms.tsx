import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface-container-lowest p-8 md:p-12 rounded-2xl border border-outline-variant">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-[#2563EB] dark:text-blue-400 hover:underline font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary-fixed p-3 rounded-xl text-[#2563EB] dark:text-blue-400">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">
            Terms of Service
          </h1>
        </div>

        <div className="max-w-none">
          <p className="text-on-surface-variant text-sm mb-8">Last updated: April 12, 2026</p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">1. Agreement to Terms</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            By accessing or using DentSide Remote, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">2. Professional Licensing and Verification</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            DentSide Remote serves verified dental professionals and licensed clinics. By registering as a practitioner, you warrant that you hold valid, active dental licenses in the jurisdictions you claim and agree to provide accurate documentation for verification.
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">3. Platform Services and Gig Matching</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            DentSide Remote connects dental professionals with remote opportunities across teledentistry, claims review, freelance engagements, and enterprise DSO contracts. Practitioners operate as independent contractors unless stated otherwise by the hiring entity.
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">4. HIPAA and Patient Privacy</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            When engaging in teledentistry or diagnostic review, practitioners and clinics must strictly adhere to HIPAA and applicable regional data-protection standards regarding Protected Health Information (PHI).
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">5. Payments and Escrow Settlement</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            Payouts are routed through supported rails such as Stripe Connect and M-Pesa. Applicable platform fees and escrow release terms are disclosed prior to accepting an engagement.
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">6. Limitation of Liability</h2>
          <p className="text-on-surface-variant mb-2 leading-relaxed">
            To the fullest extent permitted by law, DentSide Remote is not liable for indirect or consequential damages arising from platform usage or third-party clinical engagements.
          </p>
        </div>
      </div>
    </div>
  );
}
