import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Privacy() {
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
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface tracking-tight">
            Privacy Policy
          </h1>
        </div>

        <div className="max-w-none">
          <p className="text-on-surface-variant text-sm mb-8">Last updated: April 12, 2026</p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">1. Introduction</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            Welcome to DentSide Remote. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we look after your personal data when you visit our platform and outlines your privacy rights and protections.
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">2. The Data We Collect About You</h2>
          <p className="text-on-surface-variant mb-4 leading-relaxed">
            We collect, use, store, and process personal data across the following categories:
          </p>
          <ul className="list-disc pl-6 text-on-surface-variant mb-6 space-y-2">
            <li><strong className="text-on-surface">Identity Data</strong> includes full name, professional degree, and dental licensure details.</li>
            <li><strong className="text-on-surface">Contact Data</strong> includes email address and telephone numbers.</li>
            <li><strong className="text-on-surface">Financial Data</strong> includes payout rail preferences (Stripe Connect / M-Pesa) and ledger records.</li>
            <li><strong className="text-on-surface">Technical Data</strong> includes session authentication metadata, browser type, and security logs.</li>
          </ul>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">3. How We Use Your Personal Data</h2>
          <p className="text-on-surface-variant mb-4 leading-relaxed">
            We process personal data only where permitted by law, including:
          </p>
          <ul className="list-disc pl-6 text-on-surface-variant mb-6 space-y-2">
            <li>Performing marketplace matching, teledentistry consultations, and payout settlements.</li>
            <li>Supporting legitimate platform security, fraud prevention, and credential integrity.</li>
            <li>Complying with applicable healthcare and financial legal obligations.</li>
          </ul>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">4. Data Security</h2>
          <p className="text-on-surface-variant mb-6 leading-relaxed">
            We enforce strict role-based access rules, token authentication, and encrypted transport to safeguard profile and clinical data from unauthorized access or disclosure.
          </p>

          <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">5. Contact Us</h2>
          <p className="text-on-surface-variant mb-2 leading-relaxed">
            If you have questions about this privacy policy or our privacy practices, contact us at{' '}
            <a href="mailto:privacy@dentsideremote.com" className="text-[#2563EB] dark:text-blue-400 hover:underline">
              privacy@dentsideremote.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
