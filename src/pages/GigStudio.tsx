import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import ClientLayout from '../components/ClientLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  apiRequest,
  getDashboardPathForRole,
  type Gig,
  type GigStatus,
} from '../lib/api';

type GigFormState = {
  title: string;
  company: string;
  type: string;
  rateLabel: string;
  description: string;
  tagsText: string;
  remoteOnly: boolean;
  status: GigStatus;
};

const INITIAL_FORM: GigFormState = {
  title: '',
  company: '',
  type: '',
  rateLabel: '',
  description: '',
  tagsText: '',
  remoteOnly: true,
  status: 'draft',
};

export default function GigStudio() {
  const { profile } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [form, setForm] = useState<GigFormState>(INITIAL_FORM);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGigId, setEditingGigId] = useState<string | null>(null);
  const [closingGigId, setClosingGigId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    loadGigs(true);
  }, []);

  if (!profile) return null;

  if (profile.role !== 'client' && profile.role !== 'admin') {
    return <Navigate to={getDashboardPathForRole(profile.role)} replace />;
  }

  const isAdmin = profile.role === 'admin';
  const Layout = isAdmin ? AdminLayout : ClientLayout;
  const pageTitle = isAdmin ? 'Marketplace Studio' : 'Gig Studio';

  async function loadGigs(initialLoad = false) {
    setError('');
    setStatusMessage('');
    if (initialLoad) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await apiRequest<Gig[]>('/api/gigs');
      setGigs(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load gig listings.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  const managedGigs = useMemo(() => {
    if (isAdmin) return gigs;
    return gigs.filter((gig) => gig.createdBy === profile.uid);
  }, [gigs, isAdmin, profile.uid]);

  const visibleGigs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return managedGigs;
    return managedGigs.filter((gig) =>
      [gig.title, gig.company, gig.type, gig.description || '', ...gig.tags, gig.createdBy]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [deferredSearch, managedGigs]);

  const counts = useMemo(() => ({
    total: managedGigs.length,
    open: managedGigs.filter((gig) => gig.status === 'open').length,
    draft: managedGigs.filter((gig) => gig.status === 'draft').length,
    closed: managedGigs.filter((gig) => gig.status === 'closed').length,
  }), [managedGigs]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingGigId(null);
  };

  const handleEdit = (gig: Gig) => {
    setForm({
      title: gig.title,
      company: gig.company,
      type: gig.type,
      rateLabel: gig.rateLabel,
      description: gig.description || '',
      tagsText: gig.tags.join(', '),
      remoteOnly: gig.remoteOnly,
      status: gig.status,
    });
    setEditingGigId(gig.id);
    setError('');
    setStatusMessage('');
  };

  const handleSubmit = async () => {
    setError('');
    setStatusMessage('');
    const tags = form.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean);
    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      type: form.type.trim(),
      rateLabel: form.rateLabel.trim(),
      description: form.description.trim() || undefined,
      tags,
      remoteOnly: form.remoteOnly,
      status: form.status,
    };

    setIsSubmitting(true);
    try {
      if (editingGigId) {
        const updated = await apiRequest<Gig>(`/api/gigs/${editingGigId}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setGigs((current) => current.map((gig) => (gig.id === editingGigId ? updated : gig)));
        setStatusMessage('Gig updated successfully.');
      } else {
        const created = await apiRequest<Gig>('/api/gigs', { method: 'POST', body: JSON.stringify(payload) });
        setGigs((current) => [created, ...current]);
        setStatusMessage('Gig created successfully.');
      }
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to save gig.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseGig = async (gigId: string) => {
    setClosingGigId(gigId);
    setError('');
    setStatusMessage('');
    try {
      await apiRequest<{ id: string; deleted: boolean; status: GigStatus }>(`/api/gigs/${gigId}`, { method: 'DELETE' });
      setGigs((current) => current.map((gig) => gig.id === gigId ? { ...gig, status: 'closed', updatedAt: new Date().toISOString() } : gig));
      if (editingGigId === gigId) resetForm();
      setStatusMessage('Gig closed successfully.');
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : 'Unable to close gig.');
    } finally {
      setClosingGigId(null);
    }
  };

  return (
    <Layout title={pageTitle}>
      {/* Header Section */}
      <div className="mb-10">
        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">{isAdmin ? 'Marketplace Control' : 'Gig Management'}</span>
        <h1 className="text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">{pageTitle}</h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          {isAdmin
            ? 'Create listings, refine marketplace records, and close outdated clinical opportunities directly from the admin surface.'
            : 'Manage the remote roles you want clinicians to discover. Track your listings, publish updates, or close positions.'}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] border border-surface-variant/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface">{editingGigId ? 'Edit Listing' : 'New Listing'}</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">Updates post directly to the live marketplace API.</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${editingGigId ? 'bg-tertiary-fixed text-tertiary' : 'bg-primary-container/10 text-primary'}`}>
                {editingGigId ? 'Revision' : 'Live Mode'}
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Gig Title</label>
                <input type="text" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" value={form.title} onChange={(e) => setForm(c => ({ ...c, title: e.target.value }))} placeholder="Remote Clinical Supervisor" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Clinic</label>
                  <input type="text" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" value={form.company} onChange={(e) => setForm(c => ({ ...c, company: e.target.value }))} placeholder="Apollo Dental" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Type</label>
                  <input type="text" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" value={form.type} onChange={(e) => setForm(c => ({ ...c, type: e.target.value }))} placeholder="Teledentistry" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Rate Label</label>
                  <input type="text" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" value={form.rateLabel} onChange={(e) => setForm(c => ({ ...c, rateLabel: e.target.value }))} placeholder="$140/hr" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Visibility Status</label>
                  <select className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer" value={form.status} onChange={(e) => setForm(c => ({ ...c, status: e.target.value as GigStatus }))}>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="open">Open (Public)</option>
                    <option value="closed">Closed (Archived)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Description</label>
                <textarea className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={4} value={form.description} onChange={(e) => setForm(c => ({ ...c, description: e.target.value }))} placeholder="Outline responsibilities, schedule, and clinician requirements..." />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Tags (comma separated)</label>
                <input type="text" className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20" value={form.tagsText} onChange={(e) => setForm(c => ({ ...c, tagsText: e.target.value }))} placeholder="Consulting, X-ray Review" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded border-surface-variant text-primary focus:ring-primary/20" checked={form.remoteOnly} onChange={(e) => setForm(c => ({ ...c, remoteOnly: e.target.checked }))} />
                <span className="text-sm font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Remote Execution Only</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 primary-gradient text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-widest">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">{editingGigId ? 'save' : 'post_add'}</span>}
                  {editingGigId ? 'Update Record' : 'Publish Gig'}
                </button>
                {editingGigId && <button onClick={resetForm} className="px-5 py-3 bg-surface-container-low text-on-surface font-bold text-xs rounded-xl uppercase tracking-widest hover:bg-surface-container-high transition-colors">Cancel</button>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MiniStat label="Managed" value={String(counts.total)} />
            <MiniStat label="Active" value={String(counts.open)} />
            <MiniStat label="Drafts" value={String(counts.draft)} />
            <MiniStat label="Archived" value={String(counts.closed)} />
          </div>
        </div>

        {/* Listings Column */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-surface-variant/10 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input type="text" className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-11 pr-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder={isAdmin ? "Search global gig index..." : "Search your listings..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={() => loadGigs(false)} disabled={isRefreshing} className="px-5 py-3 bg-surface-container-low text-on-surface font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-surface-container-high transition-colors uppercase tracking-widest">
              {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">refresh</span>}
              Sync
            </button>
          </div>

          {error && <div className="p-4 bg-error-container/20 text-error rounded-xl text-sm font-bold flex items-center gap-2 border border-error/10"><span className="material-symbols-outlined">error</span> {error}</div>}
          {statusMessage && <div className="p-4 bg-primary-container/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2 border border-primary/20"><span className="material-symbols-outlined">check_circle</span> {statusMessage}</div>}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-surface-container-lowest rounded-xl editorial-shadow">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-slate-500 font-medium font-headline">Accessing gig database...</p>
            </div>
          ) : visibleGigs.length === 0 ? (
            <div className="text-center py-24 bg-surface-container-lowest rounded-xl editorial-shadow border border-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">work_off</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No listings found</h3>
              <p className="text-on-surface-variant max-w-sm mx-auto">Create a new gig or adjust your search to manage clinical opportunities.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {visibleGigs.map((gig) => {
                const isClosing = closingGigId === gig.id;
                return (
                  <div key={gig.id} className="bg-surface-container-lowest p-8 rounded-xl editorial-shadow border border-transparent hover:border-primary/20 transition-all group">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="font-headline text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{gig.title}</h4>
                          <StatusBadge status={gig.status} />
                          {gig.remoteOnly && <span className="bg-primary/5 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Remote</span>}
                        </div>
                        <p className="text-sm font-bold text-on-surface-variant mb-4">{gig.company} · {gig.type} · <span className="text-primary">{gig.rateLabel}</span></p>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-6 max-w-2xl">{gig.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {gig.tags.map(tag => <span key={tag} className="text-[10px] font-bold bg-secondary-container/10 text-on-secondary-container px-2 py-1 rounded uppercase tracking-wider">{tag}</span>)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-[10px] text-outline font-bold uppercase tracking-wider">
                          <span>Updated: {formatDate(gig.updatedAt)}</span>
                          {isAdmin && <span>Creator: {gig.createdByRole} · {gig.createdBy}</span>}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(gig)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Listing">
                          <span className="material-symbols-outlined">edit_square</span>
                        </button>
                        <button onClick={() => handleCloseGig(gig.id)} disabled={isClosing || gig.status === 'closed'} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-30" title="Close Listing">
                          {isClosing ? <Loader2 size={24} className="animate-spin" /> : <span className="material-symbols-outlined">archive</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-variant/10 shadow-sm">
      <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{label}</p>
      <p className="font-headline text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    open: 'bg-primary/10 text-primary',
    draft: 'bg-tertiary-fixed text-tertiary',
    closed: 'bg-error-container text-error',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorMap[status] || 'bg-surface-container-high text-outline'}`}>
      {status}
    </span>
  );
}

function formatDate(val: string) {
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
