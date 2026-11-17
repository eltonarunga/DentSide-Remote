import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Search,
  Plus,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  X,
  Briefcase,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandMark } from '../components/BrandLogo';

interface DentistProfileItem {
  id: string;
  name: string;
  title: string;
  specialty: string;
  degree: string;
  institution: string;
  experience: string;
  location: string;
  licenseState: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  avatarUrl: string;
  subSpecialties: string[];
  availableFor: string;
  verified: boolean;
}

interface GigItem {
  id: string;
  title: string;
  company: string;
  type: string;
  rate: string;
  location: string;
  applicantsCount: number;
  postedAt: string;
  description: string;
}

interface GigApplicationItem {
  id: string;
  gigId: string;
  dentistId: string;
  dentistName: string;
  dentistDegree?: string;
  specialty?: string;
  licenseNumber?: string;
  licenseState?: string;
  coverNote?: string;
  status: string;
  appliedAt: string;
}

interface ConsultationCase {
  id: string;
  patientName: string;
  urgency: string;
  caseType: string;
  status: string;
  fee: number;
  createdAt: string;
  dentistName?: string;
}

export default function ClientDashboard() {
  const { profile, logout, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'dentists' | 'gigs' | 'consultations'>(
    'overview'
  );

  const [dentists, setDentists] = useState<DentistProfileItem[]>([]);
  const [gigs, setGigs] = useState<GigItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);

  const [dentistSearch, setDentistSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [showDispatchConsultModal, setShowDispatchConsultModal] = useState(false);
  const [applicantsModalGig, setApplicantsModalGig] = useState<GigItem | null>(null);
  const [gigApplicants, setGigApplicants] = useState<GigApplicationItem[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Gig Form State
  const [gigRoleType, setGigRoleType] = useState('Teledentistry');
  const [gigPracticeName, setGigPracticeName] = useState(
    profile?.displayName || 'Pacific Dental Partners'
  );
  const [gigScope, setGigScope] = useState(
    'Virtual emergency triage and clear aligner treatment review'
  );
  const [gigHourlyRate, setGigHourlyRate] = useState<number>(110);
  const [gigTitle, setGigTitle] = useState('');
  const [gigDescription, setGigDescription] = useState('');
  const [gigRequirements, setGigRequirements] = useState(
    'Active state dental license\n2+ years clinical experience\nInvisalign certification'
  );
  const [isGeneratingGigAI, setIsGeneratingGigAI] = useState(false);
  const [isSubmittingGig, setIsSubmittingGig] = useState(false);

  // Dispatch Teledentistry Case Form State
  const [assignedDentist, setAssignedDentist] = useState<DentistProfileItem | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender] = useState('Female');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [consultUrgency, setConsultUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>(
    'Urgent'
  );
  const [consultCaseType, setConsultCaseType] = useState<
    | 'Orthodontic Review'
    | 'Clear Aligner Staging'
    | 'Telediagnostic Second Opinion'
    | 'Radiology Review'
    | 'Emergency Triage'
  >('Telediagnostic Second Opinion');
  const [consultFee, setConsultFee] = useState<number>(95);
  const [isDispatching, setIsDispatching] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dentistsRes, gigsRes, consultRes] = await Promise.all([
        fetch('/api/dentists'),
        fetch('/api/gigs'),
        apiFetch('/api/consultations'),
      ]);

      if (dentistsRes.ok) setDentists(await dentistsRes.json());
      if (gigsRes.ok) setGigs(await gigsRes.json());
      if (consultRes.ok) setConsultations(await consultRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewApplicants = async (gig: GigItem) => {
    setApplicantsModalGig(gig);
    setLoadingApplicants(true);
    setGigApplicants([]);
    try {
      const res = await apiFetch(`/api/gigs/${gig.id}/applications`);
      if (res.ok) {
        setGigApplicants(await res.json());
      } else {
        const err = await res.json();
        showToast(err.error || 'Could not load applicants.');
      }
    } catch {
      showToast('Failed to load applicants.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleAiGenerateGig = async () => {
    setIsGeneratingGigAI(true);
    try {
      const res = await apiFetch('/api/ai/generate-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleType: gigRoleType,
          practiceName: gigPracticeName,
          scope: gigScope,
          targetRate: gigHourlyRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate AI gig draft.');
      }
      setGigTitle(data.title || `Remote ${gigRoleType} Specialist`);
      setGigDescription(data.description || '');
      if (data.requirements) setGigRequirements(data.requirements.join('\n'));
      if (data.rateNum) setGigHourlyRate(data.rateNum);
      showToast('AI Gig draft generated!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Could not generate AI gig draft.');
    } finally {
      setIsGeneratingGigAI(false);
    }
  };

  const handleCreateGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGig(true);
    try {
      const requirementsList = gigRequirements
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await apiFetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: gigTitle || `Remote ${gigRoleType} Consultant`,
          company: gigPracticeName,
          type: gigRoleType,
          rate: `$${gigHourlyRate}/hr`,
          rateNum: Number(gigHourlyRate),
          location: 'Remote',
          description: gigDescription || gigScope,
          requirements: requirementsList.length > 0 ? requirementsList : ['Active dental license'],
          tags: ['Teledentistry', 'Remote', gigRoleType],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to post gig');
      }
      const newGig = await res.json();
      setGigs((prev) => [newGig, ...prev]);
      setShowPostGigModal(false);
      showToast('Gig opportunity published live to all licensed dentists!');
    } catch (err: any) {
      showToast(err.message || 'Error posting gig.');
    } finally {
      setIsSubmittingGig(false);
    }
  };

  const handleDispatchConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !chiefComplaint) {
      showToast('Please fill out patient name and chief complaint.');
      return;
    }

    setIsDispatching(true);
    try {
      const symptoms = symptomsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await apiFetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientAge: Number(patientAge),
          patientGender,
          chiefComplaint,
          symptoms: symptoms.length > 0 ? symptoms : ['Sensitivity', 'Consultation Needed'],
          urgency: consultUrgency,
          caseType: consultCaseType,
          clientName: profile?.displayName || 'Pacific Dental Partners',
          fee: Number(consultFee),
          scanImageUrl:
            'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80',
          ...(assignedDentist
            ? { dentistId: assignedDentist.id, dentistName: assignedDentist.name }
            : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to dispatch consultation');
      }
      const newCase = await res.json();
      setConsultations((prev) => [newCase, ...prev]);
      setShowDispatchConsultModal(false);
      setAssignedDentist(null);
      showToast('Teledentistry case dispatched to clinical queue!');
      setPatientName('');
      setChiefComplaint('');
      setSymptomsInput('');
    } catch (err: any) {
      showToast(err.message || 'Error dispatching case.');
    } finally {
      setIsDispatching(false);
    }
  };

  const filteredDentists = dentists.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(dentistSearch.toLowerCase()) ||
      d.specialty.toLowerCase().includes(dentistSearch.toLowerCase()) ||
      d.location.toLowerCase().includes(dentistSearch.toLowerCase()) ||
      d.subSpecialties.some((s) => s.toLowerCase().includes(dentistSearch.toLowerCase()));
    const matchesSpecialty =
      specialtyFilter === 'All' ||
      d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  const activeEscrowTotal = consultations
    .filter((c) => c.status !== 'Completed')
    .reduce((sum, c) => sum + c.fee, 0);

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="bg-background/88 backdrop-blur-xl border-b border-outline-variant px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <BrandMark size={32} />
          <div>
            <span className="text-lg font-extrabold text-on-surface tracking-tight font-headline block leading-none">
              Dent<span className="text-[#2563EB] dark:text-blue-400">Side</span>{' '}
              <span className="font-semibold text-on-surface-variant text-sm">Client</span>
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium hidden sm:block mt-0.5">
              Practice &amp; Clinic Management Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPostGigModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Post a Remote Gig
          </button>

          <button
            onClick={() => {
              setAssignedDentist(null);
              setShowDispatchConsultModal(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-on-surface text-background hover:opacity-90 rounded-xl text-xs font-semibold transition-opacity whitespace-nowrap"
          >
            <Stethoscope className="w-4 h-4 text-[#2563EB] dark:text-blue-500" /> Dispatch Case
          </button>

          <ThemeToggle />

          <div className="h-5 w-px bg-outline-variant hidden sm:block" />

          <span className="text-xs font-medium text-on-surface-variant hidden md:block">
            {profile?.displayName || 'Pacific Dental Partners'}
          </span>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-surface-container"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-background border-b border-outline-variant px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-semibold tracking-wide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('dentists')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap tabular-nums ${
              activeTab === 'dentists'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Verified Dentists ({dentists.length})
          </button>
          <button
            onClick={() => setActiveTab('gigs')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap tabular-nums ${
              activeTab === 'gigs'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            My Job Postings ({gigs.length})
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3.5 border-b-2 transition-colors whitespace-nowrap tabular-nums ${
              activeTab === 'consultations'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Dispatched Consults ({consultations.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {loading && activeTab === 'overview' && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin text-[#2563EB] dark:text-blue-400" /> Syncing practice metrics...
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Active Job Postings
                </span>
                <span className="text-2xl font-extrabold text-on-surface tabular-nums">
                  {gigs.length}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                  Live in marketplace
                </span>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Teledentistry Cases
                </span>
                <span className="text-2xl font-extrabold text-on-surface tabular-nums">
                  {consultations.length}
                </span>
                <span className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold block mt-1">
                  Direct triage queue
                </span>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Verified Dentists
                </span>
                <span className="text-2xl font-extrabold text-on-surface tabular-nums">
                  {dentists.length} Available
                </span>
                <span className="text-xs text-on-surface-variant font-medium block mt-1">
                  State board validated
                </span>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                  Active Case Escrow
                </span>
                <span className="text-2xl font-extrabold text-on-surface tabular-nums">
                  ${activeEscrowTotal.toFixed(2)}
                </span>
                <span className="text-xs text-on-surface-variant font-medium block mt-1">
                  Pending consultation fees
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => setShowPostGigModal(true)}
                className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-[#2563EB] transition-colors cursor-pointer group"
              >
                <div className="bg-primary-fixed w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
                  <Briefcase className="w-5 h-5 text-[#2563EB] dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <h2 className="text-lg font-bold text-on-surface font-headline">
                    Post a Remote Dental Gig
                  </h2>
                  <span className="text-[#2563EB] dark:text-blue-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Assisted
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                  Recruit licensed DDS/DMD practitioners for teledentistry, insurance claims review, or clear aligner CAD staging.
                </p>
                <span className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 group-hover:underline flex items-center gap-1">
                  Draft &amp; Publish Position →
                </span>
              </div>

              <div
                onClick={() => {
                  setAssignedDentist(null);
                  setShowDispatchConsultModal(true);
                }}
                className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-[#2563EB] transition-colors cursor-pointer group"
              >
                <div className="bg-surface-container w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-on-surface transition-colors">
                  <Stethoscope className="w-5 h-5 text-on-surface group-hover:text-background transition-colors" />
                </div>
                <div className="flex items-center gap-2.5 mb-2">
                  <h2 className="text-lg font-bold text-on-surface font-headline">
                    Dispatch Teledentistry Case
                  </h2>
                  <span className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                    On-Demand
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs leading-relaxed mb-4">
                  Submit a patient triage case, attach intraoral scans, and receive an official SOAP diagnosis within hours.
                </p>
                <span className="text-xs font-semibold text-on-surface group-hover:text-[#2563EB] dark:group-hover:text-blue-400 group-hover:underline flex items-center gap-1">
                  Create Patient Triage Case →
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-on-surface text-sm font-headline">
                  Recent Consultations Dispatched
                </h3>
                <button
                  onClick={() => setActiveTab('consultations')}
                  className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline"
                >
                  View All Cases
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant text-on-surface-variant font-semibold uppercase text-[11px]">
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">Case Type</th>
                      <th className="pb-3">Urgency</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {consultations.slice(0, 5).map((c) => (
                      <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3.5 font-semibold text-on-surface">{c.patientName}</td>
                        <td className="py-3.5 text-on-surface-variant">{c.caseType}</td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              c.urgency === 'Emergency'
                                ? 'bg-red-500/12 text-red-700 dark:text-red-400'
                                : c.urgency === 'Urgent'
                                ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {c.urgency}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`font-semibold ${
                              c.status === 'Completed'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-[#2563EB] dark:text-blue-400'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-on-surface text-right tabular-nums">
                          ${c.fee}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dentists' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dentist, specialty, state..."
                  value={dentistSearch}
                  onChange={(e) => setDentistSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs w-full sm:w-auto overflow-x-auto">
                <span className="text-on-surface-variant font-semibold uppercase text-[11px] shrink-0">
                  Filter:
                </span>
                {['All', 'General', 'Orthodontics', 'Radiology'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpecialtyFilter(s)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                      specialtyFilter === s
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredDentists.map((d) => (
                <div
                  key={d.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex flex-col justify-between hover:border-[#2563EB]/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src={d.avatarUrl}
                        alt={d.name}
                        className="w-14 h-14 rounded-xl object-cover border border-outline-variant"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-on-surface text-sm font-headline">{d.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
                        </div>
                        <p className="text-xs font-semibold text-[#2563EB] dark:text-blue-400">
                          {d.specialty}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">{d.location}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-5 text-xs">
                      <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant space-y-1">
                        <div className="text-on-surface-variant text-[11px]">
                          <strong className="text-on-surface">Degree:</strong> {d.degree}
                        </div>
                        <div className="text-on-surface-variant text-[11px]">
                          <strong className="text-on-surface">License:</strong> {d.licenseState}
                        </div>
                      </div>

                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {d.subSpecialties.join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-on-surface-variant font-semibold block">
                        Rate
                      </span>
                      <span className="font-bold text-on-surface text-sm tabular-nums">
                        ${d.hourlyRate}/hr
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setAssignedDentist(d);
                        setConsultFee(d.hourlyRate);
                        setShowDispatchConsultModal(true);
                      }}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Request Consult
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gigs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-on-surface font-headline">
                  Your Practice Gig Opportunities
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Manage listings visible to qualified dentists nationwide
                </p>
              </div>
              <button
                onClick={() => setShowPostGigModal(true)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" /> Post New Gig
              </button>
            </div>

            <div className="space-y-4">
              {gigs.map((g) => (
                <div
                  key={g.id}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-on-surface text-sm font-headline">{g.title}</h4>
                      <span className="text-[#2563EB] dark:text-blue-400 text-[11px] font-semibold uppercase tracking-wider">
                        · {g.type}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                      {g.description}
                    </p>
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-2 pt-1 tabular-nums">
                      <span>Posted {g.postedAt}</span>
                      <span>·</span>
                      <span>{g.applicantsCount} Dentist Applicants</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-on-surface text-sm tabular-nums">{g.rate}</span>
                    <button
                      onClick={() => handleViewApplicants(g)}
                      className="px-3.5 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface rounded-xl text-xs font-semibold transition-colors tabular-nums"
                    >
                      View Applicants ({g.applicantsCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-on-surface font-headline">
                  Teledentistry Consultations Tracker
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Live feed of patient digital triage &amp; SOAP diagnoses
                </p>
              </div>
              <button
                onClick={() => {
                  setAssignedDentist(null);
                  setShowDispatchConsultModal(true);
                }}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" /> Dispatch Case
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-on-surface text-sm block font-headline">
                        {c.patientName}
                      </span>
                      <span className="text-xs font-semibold text-[#2563EB] dark:text-blue-400">
                        {c.caseType}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                        c.status === 'Completed'
                          ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                          : 'bg-primary-fixed text-on-primary-fixed-variant'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant text-xs text-on-surface-variant space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span>Assigned Practitioner</span>
                      <span className="font-semibold text-on-surface">
                        {c.dentistName || 'Pending Triage Claim'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span>Escrow Payout</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ${c.fee}.00
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: POST A GIG */}
      {showPostGigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-outline-variant max-h-[90vh] overflow-y-auto animate-up">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                <h3 className="font-bold text-on-surface text-base font-headline">
                  Create Dental Gig Opportunity
                </h3>
              </div>
              <button
                onClick={() => setShowPostGigModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-primary-fixed p-3.5 rounded-xl border border-[#2563EB]/20 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-on-primary-fixed-variant flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Gig Description Generator
                </span>
                <button
                  type="button"
                  onClick={handleAiGenerateGig}
                  disabled={isGeneratingGigAI}
                  className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  {isGeneratingGigAI ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Generate with Gemini'
                  )}
                </button>
              </div>
              <p className="text-[11px] text-on-primary-fixed-variant leading-relaxed">
                Enter your practice name and scope below, then click Generate for instant market-aligned rate &amp; requirements.
              </p>
            </div>

            <form onSubmit={handleCreateGigSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">
                    Role Type
                  </label>
                  <select
                    value={gigRoleType}
                    onChange={(e) => setGigRoleType(e.target.value)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-medium text-on-surface focus:border-[#2563EB] outline-none"
                  >
                    <option value="Teledentistry">Teledentistry</option>
                    <option value="Freelance">Freelance CAD Staging</option>
                    <option value="Insurance">Insurance Claims Audit</option>
                    <option value="AI Review">Dental AI Annotation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">
                    Hourly Budget (USD)
                  </label>
                  <input
                    type="number"
                    value={gigHourlyRate}
                    onChange={(e) => setGigHourlyRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface tabular-nums focus:border-[#2563EB] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Practice / Clinic Name
                </label>
                <input
                  type="text"
                  required
                  value={gigPracticeName}
                  onChange={(e) => setGigPracticeName(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:border-[#2563EB] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  placeholder="e.g. Remote Teledentistry Specialist (Evening Coverage)"
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Role Scope / Summary
                </label>
                <textarea
                  rows={2}
                  required
                  value={gigDescription}
                  onChange={(e) => setGigDescription(e.target.value)}
                  placeholder="Describe patient consult scope, schedule, and deliverables..."
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Qualifications &amp; Requirements (One per line)
                </label>
                <textarea
                  rows={2}
                  value={gigRequirements}
                  onChange={(e) => setGigRequirements(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:border-[#2563EB] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-outline-variant flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostGigModal(false)}
                  className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-container rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGig}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSubmittingGig && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish Gig
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH TELEDENTISTRY CASE */}
      {showDispatchConsultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-outline-variant max-h-[90vh] overflow-y-auto animate-up">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                <h3 className="font-bold text-on-surface text-base font-headline">
                  Dispatch Teledentistry Patient Case
                </h3>
              </div>
              <button
                onClick={() => setShowDispatchConsultModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignedDentist && (
              <div className="bg-primary-fixed border border-[#2563EB]/20 rounded-xl p-3 text-xs flex items-center justify-between text-on-primary-fixed-variant">
                <span>
                  Assigning directly to: <strong>{assignedDentist.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setAssignedDentist(null)}
                  className="text-[#2563EB] dark:text-blue-300 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            )}

            <form onSubmit={handleDispatchConsultSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-on-surface-variant mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Jessica Miller"
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface tabular-nums focus:border-[#2563EB] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">Urgency</label>
                  <select
                    value={consultUrgency}
                    onChange={(e) => setConsultUrgency(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl font-semibold text-on-surface focus:border-[#2563EB] outline-none"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent (24h)</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface-variant mb-1">
                    Case Type
                  </label>
                  <select
                    value={consultCaseType}
                    onChange={(e) => setConsultCaseType(e.target.value as any)}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface focus:border-[#2563EB] outline-none"
                  >
                    <option value="Telediagnostic Second Opinion">Telediagnostic 2nd Opinion</option>
                    <option value="Clear Aligner Staging">Clear Aligner Staging</option>
                    <option value="Emergency Triage">Emergency Triage</option>
                    <option value="Radiology Review">Radiology Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Chief Complaint *
                </label>
                <textarea
                  rows={2}
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe localized pain, swelling, tooth number, or aligner issue..."
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Symptoms (Comma-separated)
                </label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  placeholder="Lingering cold pain, Mastication discomfort, Bleeding"
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface-variant mb-1">
                  Consultation Disbursement Fee (USD)
                </label>
                <input
                  type="number"
                  value={consultFee}
                  onChange={(e) => setConsultFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface tabular-nums focus:border-[#2563EB] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-outline-variant flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchConsultModal(false)}
                  className="px-4 py-2 text-on-surface-variant font-semibold hover:bg-surface-container rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isDispatching && <Loader2 className="w-4 h-4 animate-spin" />}
                  Dispatch Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW APPLICANTS */}
      {applicantsModalGig && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-outline-variant max-h-[85vh] overflow-y-auto animate-up">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-bold text-on-surface text-base font-headline">Gig Applicants</h3>
                <p className="text-xs text-on-surface-variant">{applicantsModalGig.title}</p>
              </div>
              <button
                onClick={() => setApplicantsModalGig(null)}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingApplicants ? (
              <div className="py-10 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] dark:text-blue-400 mx-auto" />
              </div>
            ) : gigApplicants.length === 0 ? (
              <div className="py-10 text-center text-xs text-on-surface-variant">
                No dentist applications filed for this position yet.
              </div>
            ) : (
              <div className="space-y-3">
                {gigApplicants.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-outline-variant bg-surface-container-low space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-on-surface text-sm font-headline">
                          {app.dentistName}
                        </p>
                        <p className="text-[#2563EB] dark:text-blue-400 font-semibold">
                          {app.dentistDegree || 'DDS'} · {app.specialty || 'General Dentistry'}
                        </p>
                      </div>
                      <span className="bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                        {app.status}
                      </span>
                    </div>
                    {app.licenseNumber && (
                      <p className="text-on-surface-variant font-mono tabular-nums">
                        License: {app.licenseNumber}{' '}
                        {app.licenseState ? `(${app.licenseState})` : ''}
                      </p>
                    )}
                    {app.coverNote && (
                      <p className="text-on-surface bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                        {app.coverNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
