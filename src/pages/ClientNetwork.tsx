import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { apiRequest, type PublicDentistProfile } from '../lib/api';
import { Loader2 } from 'lucide-react';

export default function ClientNetwork() {
  const [query, setQuery] = useState('');
  const [dentists, setDentists] = useState<PublicDentistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        setError('');
        const search = query.trim();
        const searchParams = new URLSearchParams();

        if (search) {
          searchParams.set('search', search);
        }

        const path = searchParams.size > 0 ? `/api/dentists?${searchParams.toString()}` : '/api/dentists';
        const data = await apiRequest<PublicDentistProfile[]>(path);

        if (!cancelled) {
          setDentists(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error ? loadError.message : 'Unable to load verified dentists right now.';
          setError(message);
          setDentists([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <ClientLayout title="Find a Dentist">
      {/* Header Section */}
      <div className="mb-10">
        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Global Directory</span>
        <h1 className="text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">Dental Network</h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">Browse verified professionals, review their clinical focus, and request a teledentistry consult in seconds.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="md:col-span-3 bg-surface-container-lowest editorial-shadow rounded-2xl p-4">
          <label className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2 block">Professional Search</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, specialty, or clinical interest…"
              className="w-full bg-surface-container-low border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 py-3 pl-11 pr-4 outline-none"
            />
          </div>
        </div>
        <div className="md:col-span-1 flex items-end">
          <button className="w-full primary-gradient text-white font-bold h-14 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 scale-95 active:scale-100 transition-transform">
            <span className="material-symbols-outlined">filter_list</span>
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Dentist Results */}
        <div className="col-span-12 lg:col-span-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-slate-500 font-medium font-headline">Scanning network...</p>
            </div>
          ) : dentists.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-2xl editorial-shadow border border-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_search</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No professionals found</h3>
              <p className="text-on-surface-variant max-w-md mx-auto">Try adjusting your search terms to find available practitioners.</p>
              <button
                onClick={() => setQuery('')}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {dentists.map((dentist) => {
                const searchParams = new URLSearchParams({
                  dentistId: dentist.id,
                  dentistName: dentist.displayName || 'Doctor',
                });

                return (
                  <div key={dentist.id} className="bg-surface-container-lowest rounded-2xl p-6 editorial-shadow border border-transparent hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-6 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low flex-shrink-0 border-2 border-primary-container/10">
                      <img
                        src={dentist.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${dentist.displayName || 'D'}`}
                        alt={dentist.displayName || 'Dentist'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-xl font-bold font-headline group-hover:text-primary transition-colors">
                            {dentist.displayName || 'Verified Practitioner'}
                          </h2>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Approved
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
                          {dentist.experience || 'Board certified specialist focusing on complex restorative and remote consultations.'}
                        </p>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-xs text-outline font-medium">
                            <span className="material-symbols-outlined text-sm mr-1.5 text-primary">location_on</span>
                            {dentist.availability || 'Remote Availability'}
                          </div>
                          <div className="flex items-center text-xs text-outline font-medium">
                            <span className="material-symbols-outlined text-sm mr-1.5 text-primary">clinical_notes</span>
                            {dentist.onboardingComplete ? 'Profile Complete' : 'Profile Active'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {dentist.interests?.slice(0, 4).map((interest, i) => (
                          <span key={i} className="text-[10px] font-bold bg-secondary-container/10 text-on-secondary-container px-2 py-1 rounded uppercase tracking-wider">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:justify-center">
                      <Link
                        to={`/client/appointments?${searchParams.toString()}`}
                        className="bg-surface-container-high text-on-surface font-bold px-6 py-3 rounded-xl text-xs hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-center whitespace-nowrap"
                      >
                        Request Consult
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Context */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="p-8 rounded-xl bg-surface-container-low shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight font-headline">Clinical Integrity</h2>
              <span className="material-symbols-outlined text-primary">security</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Every practitioner in our network has undergone a rigorous secondary verification process, including state license validation and identity confirmation.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-xs font-bold text-on-surface">Verified Identity</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-xs font-bold text-on-surface">License Validation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-xs font-bold text-on-surface">Clinical Specialty Review</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-inverse-surface text-white shadow-xl space-y-6">
            <h2 className="text-lg font-bold tracking-tight opacity-90 font-headline">What's Next?</h2>
            <div className="space-y-4 text-sm opacity-80 leading-relaxed">
              <p>1. <strong>Select a specialist</strong> based on your specific clinical needs.</p>
              <p>2. <strong>Describe your case</strong> in the consult request form.</p>
              <p>3. <strong>Collaborate</strong> directly with the dentist through our secure portal.</p>
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
    </ClientLayout>
  );
}
