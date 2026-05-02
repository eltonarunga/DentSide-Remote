import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter({ className = '' }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={[
        'border-t border-outline-variant/20 bg-surface px-8 py-12',
        'flex flex-col md:flex-row items-start md:items-center justify-between gap-10',
        className,
      ].join(' ')}
    >
      <div className="space-y-4">
        <span className="font-headline text-2xl font-black text-on-surface tracking-tighter">
          DentSide <span className="text-primary italic">Remote</span>
        </span>
        <p className="text-sm font-medium text-on-surface-variant max-w-xs">
          Empowering dental professionals through precision teledentistry and remote clinical opportunities.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-10 md:gap-20">
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-outline uppercase tracking-widest">Platform</h4>
          <nav className="flex flex-col gap-2">
            <a href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Marketplace</a>
            <a href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Credentialing</a>
            <a href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Wallet</a>
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-outline uppercase tracking-widest">Legal</h4>
          <nav className="flex flex-col gap-2">
            <Link to="/terms" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Privacy</Link>
          </nav>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-outline uppercase tracking-widest">Contact</h4>
          <nav className="flex flex-col gap-2">
            <a href="mailto:support@dentsideremote.com" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
              support@dentsideremote.com
            </a>
          </nav>
        </div>
      </div>

      <div className="w-full md:w-auto pt-10 md:pt-0 border-t md:border-none border-outline-variant/10 text-xs font-bold text-outline uppercase tracking-widest">
        © {year} DentSide Remote
      </div>
    </footer>
  );
}
