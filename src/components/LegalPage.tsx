import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

type LegalSection = {
  heading: string;
  body?: string[];
  bullets?: string[];
};

export default function LegalPage({
  title,
  subtitle,
  updatedAt,
  icon,
  sections,
}: {
  title: string;
  subtitle: string;
  updatedAt: string;
  icon: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-8 flex items-center justify-between">
        <BrandMark size={32} />
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to home
        </Link>
      </header>

      <main className="pt-32 pb-24 px-8 max-w-5xl mx-auto">
        <div className="bg-surface-container-lowest rounded-[2.5rem] editorial-shadow border border-outline-variant/10 overflow-hidden">
          <div className="border-b border-outline-variant/10 p-10 md:p-14">
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-4 block">Legal Documentation</span>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
                {icon}
              </div>
              <div>
                <h1 className="font-headline text-4xl md:text-6xl font-black text-on-surface tracking-tighter leading-tight mb-4">
                  {title}
                </h1>
                <p className="text-lg text-on-surface-variant font-medium max-w-2xl leading-relaxed mb-6">
                  {subtitle}
                </p>
                <div className="inline-flex items-center rounded-full bg-surface-container-high px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-outline">
                  Last updated {updatedAt}
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 md:p-14 space-y-12">
            {sections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
                  {section.heading}
                </h2>

                <div className="space-y-4">
                  {section.body?.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-base text-on-surface-variant font-medium leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.bullets && (
                  <ul className="space-y-3">
                    {section.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex gap-4 text-base text-on-surface-variant font-medium leading-relaxed"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
