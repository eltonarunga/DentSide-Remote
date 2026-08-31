import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, 
  User as UserIcon, 
  Search, 
  Calendar, 
  Plus, 
  Sparkles, 
  Stethoscope, 
  ShieldCheck, 
  Star, 
  DollarSign, 
  CheckCircle2, 
  Loader2, 
  X,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';

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
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'dentists' | 'gigs' | 'consultations'>('overview');
  
  // Data States
  const [dentists, setDentists] = useState<DentistProfileItem[]>([]);
  const [gigs, setGigs] = useState<GigItem[]>([]);
  const [consultations, setConsultations] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [dentistSearch, setDentistSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // Modals
  const [showPostGigModal, setShowPostGigModal] = useState(false);
  const [showDispatchConsultModal, setShowDispatchConsultModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Gig Form State
  const [gigRoleType, setGigRoleType] = useState('Teledentistry');
  const [gigPracticeName, setGigPracticeName] = useState(profile?.displayName || 'Pacific Dental Partners');
  const [gigScope, setGigScope] = useState('Virtual emergency triage and clear aligner treatment review');
  const [gigHourlyRate, setGigHourlyRate] = useState<number>(110);
  const [gigTitle, setGigTitle] = useState('');
  const [gigDescription, setGigDescription] = useState('');
  const [gigRequirements, setGigRequirements] = useState('Active state dental license, 2+ years clinical experience, Invisalign certification');
  const [isGeneratingGigAI, setIsGeneratingGigAI] = useState(false);
  const [isSubmittingGig, setIsSubmittingGig] = useState(false);

  // Dispatch Teledentistry Case Form State
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState('Female');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [consultUrgency, setConsultUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>('Urgent');
  const [consultCaseType, setConsultCaseType] = useState<'Orthodontic Review' | 'Clear Aligner Staging' | 'Telediagnostic Second Opinion' | 'Radiology Review' | 'Emergency Triage'>('Telediagnostic Second Opinion');
  const [consultFee, setConsultFee] = useState<number>(95);
  const [isDispatching, setIsDispatching] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dentistsRes, gigsRes, consultRes] = await Promise.all([
        fetch('/api/dentists'),
        fetch('/api/gigs'),
        fetch('/api/consultations')
      ]);

      if (dentistsRes.ok) setDentists(await dentistsRes.json());
      if (gigsRes.ok) setGigs(await gigsRes.json());
      if (consultRes.ok) setConsultations(await consultRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // AI Gig Draft Generator
  const handleAiGenerateGig = async () => {
    setIsGeneratingGigAI(true);
    try {
      const res = await fetch('/api/ai/generate-gig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleType: gigRoleType,
          practiceName: gigPracticeName,
          scope: gigScope,
          targetRate: gigHourlyRate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGigTitle(data.title || `Remote ${gigRoleType} Specialist`);
        setGigDescription(data.description || '');
        if (data.requirements) setGigRequirements(data.requirements.join('\n'));
        if (data.rateNum) setGigHourlyRate(data.rateNum);
        showToast('AI Gig draft generated!');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not generate AI gig draft.');
    } finally {
      setIsGeneratingGigAI(false);
    }
  };

  // Submit New Gig
  const handleCreateGigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGig(true);
    try {
      const requirementsList = gigRequirements
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/gigs', {
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
          tags: ['Teledentistry', 'Remote', gigRoleType]
        })
      });

      if (!res.ok) throw new Error('Failed to post gig');
      const newGig = await res.json();
      setGigs(prev => [newGig, ...prev]);
      setShowPostGigModal(false);
      showToast('Gig opportunity published live to all licensed dentists!');
    } catch (err: any) {
      showToast(err.message || 'Error posting gig.');
    } finally {
      setIsSubmittingGig(false);
    }
  };

  // Dispatch Teledentistry Case
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
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/consultations', {
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
          clientId: 'client-demo',
          clientName: profile?.displayName || 'Pacific Dental Partners',
          fee: Number(consultFee),
          scanImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80'
        })
      });

      if (!res.ok) throw new Error('Failed to dispatch consultation');
      const newCase = await res.json();
      setConsultations(prev => [newCase, ...prev]);
      setShowDispatchConsultModal(false);
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

  const filteredDentists = dentists.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(dentistSearch.toLowerCase()) ||
                          d.specialty.toLowerCase().includes(dentistSearch.toLowerCase()) ||
                          d.location.toLowerCase().includes(dentistSearch.toLowerCase()) ||
                          d.subSpecialties.some(s => s.toLowerCase().includes(dentistSearch.toLowerCase()));
    const matchesSpecialty = specialtyFilter === 'All' || d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase());
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-[#0077B6] p-1.5 rounded-lg text-white">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block leading-none">DentSide Client Portal</span>
            <span className="text-[11px] text-slate-500 font-medium">Practice & Clinic Management Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPostGigModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> Post a Remote Gig
          </button>
          
          <button
            onClick={() => setShowDispatchConsultModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <Stethoscope className="w-4 h-4 text-cyan-300" /> Dispatch Teledentistry Case
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <span className="text-xs font-medium text-slate-700 hidden md:block">
            {profile?.displayName || 'Pacific Dental Partners'}
          </span>
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'overview' 
                ? 'border-[#0077B6] text-[#0077B6]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('dentists')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'dentists' 
                ? 'border-[#0077B6] text-[#0077B6]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Verified Dentists ({dentists.length})
          </button>
          <button
            onClick={() => setActiveTab('gigs')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'gigs' 
                ? 'border-[#0077B6] text-[#0077B6]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Job Postings ({gigs.length})
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3.5 border-b-2 transition-colors ${
              activeTab === 'consultations' 
                ? 'border-[#0077B6] text-[#0077B6]' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dispatched Consults ({consultations.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top KPI Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Job Postings</span>
                <span className="text-2xl font-bold text-slate-900">{gigs.length}</span>
                <span className="text-xs text-emerald-600 font-semibold block mt-1">Live in marketplace</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Teledentistry Cases</span>
                <span className="text-2xl font-bold text-slate-900">{consultations.length}</span>
                <span className="text-xs text-[#0077B6] font-semibold block mt-1">Direct triage queue</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Verified Dentists</span>
                <span className="text-2xl font-bold text-slate-900">{dentists.length} Available</span>
                <span className="text-xs text-teal-600 font-semibold block mt-1">State board validated</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Escrow Vault</span>
                <span className="text-2xl font-bold text-slate-900">$2,450.00</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Protected disbursements</span>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div 
                onClick={() => setShowPostGigModal(true)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#0077B6] transition-all cursor-pointer group"
              >
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0077B6] transition-colors">
                  <Briefcase className="w-6 h-6 text-[#0077B6] group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-slate-900">Post a Remote Dental Gig</h2>
                  <span className="bg-blue-100 text-[#0077B6] px-2 py-0.5 rounded-md text-[10px] font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Assisted
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Recruit licensed DDS/DMD practitioners for teledentistry, insurance claims review, or clear aligner CAD staging.
                </p>
                <span className="text-xs font-bold text-[#0077B6] group-hover:underline flex items-center gap-1">
                  Draft & Publish Position →
                </span>
              </div>

              <div 
                onClick={() => setShowDispatchConsultModal(true)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-500 transition-all cursor-pointer group"
              >
                <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 transition-colors">
                  <Stethoscope className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-slate-900">Dispatch Teledentistry Case</h2>
                  <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">
                    On-Demand
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Submit a patient triage case, upload intraoral images or 3D scans, and receive an official SOAP diagnosis within hours.
                </p>
                <span className="text-xs font-bold text-teal-700 group-hover:underline flex items-center gap-1">
                  Create Patient Triage Case →
                </span>
              </div>
            </div>

            {/* Recent Teledentistry Activity Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Consultations Dispatched</h3>
                <button onClick={() => setActiveTab('consultations')} className="text-xs font-bold text-[#0077B6] hover:underline">
                  View All Cases
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">Case Type</th>
                      <th className="pb-3">Urgency</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultations.slice(0, 3).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-900">{c.patientName}</td>
                        <td className="py-3 text-slate-600">{c.caseType}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                            c.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.urgency}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`font-semibold ${c.status === 'Completed' ? 'text-emerald-600' : 'text-[#0077B6]'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-800">${c.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERIFIED DENTISTS DIRECTORY */}
        {activeTab === 'dentists' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search dentist, specialty, state..."
                  value={dentistSearch}
                  onChange={e => setDentistSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Filter:</span>
                {['All', 'General', 'Orthodontics', 'Radiology'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpecialtyFilter(s)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      specialtyFilter === s ? 'bg-[#0077B6] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredDentists.map(d => (
                <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={d.avatarUrl} alt={d.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">{d.name}</h4>
                          <ShieldCheck className="w-4 h-4 text-[#0077B6]" />
                        </div>
                        <p className="text-[11px] font-semibold text-[#0077B6]">{d.specialty}</p>
                        <p className="text-[10px] text-slate-400">{d.location}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="text-slate-500 text-[11px]">
                          <strong>Degree:</strong> {d.degree}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          <strong>License:</strong> {d.licenseState}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {d.subSpecialties.map((sub, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">Rate</span>
                      <span className="font-bold text-slate-900 text-sm">${d.hourlyRate}/hr</span>
                    </div>

                    <button
                      onClick={() => {
                        setShowDispatchConsultModal(true);
                        showToast(`Selected ${d.name} for consult assignment.`);
                      }}
                      className="px-3.5 py-1.5 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Request Consult
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: GIGS POSTED */}
        {activeTab === 'gigs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Practice Gig Opportunities</h3>
                <p className="text-xs text-slate-500">Manage listings visible to qualified dentists nationwide</p>
              </div>
              <button
                onClick={() => setShowPostGigModal(true)}
                className="px-4 py-2 bg-[#0077B6] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Post New Gig
              </button>
            </div>

            <div className="space-y-4">
              {gigs.map(g => (
                <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{g.title}</h4>
                      <span className="bg-blue-50 text-[#0077B6] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {g.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl">{g.description}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                      <span>Posted {g.postedAt}</span>
                      <span>•</span>
                      <span>{g.applicantsCount} Dentist Applicants</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-slate-900 text-sm">{g.rate}</span>
                    <button 
                      onClick={() => showToast('Opening applicants credential reviews...')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      View Applicants ({g.applicantsCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DISPATCHED CONSULTATIONS */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Teledentistry Consultations Tracker</h3>
                <p className="text-xs text-slate-500">Live feed of patient digital triage & SOAP diagnoses</p>
              </div>
              <button
                onClick={() => setShowDispatchConsultModal(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Dispatch Case
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultations.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{c.patientName}</span>
                      <span className="text-xs font-semibold text-[#0077B6]">{c.caseType}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      c.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Assigned Practitioner:</span>
                      <span className="font-semibold text-slate-800">{c.dentistName || 'Pending Triage Claim'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Escrow Payout:</span>
                      <span className="font-bold text-emerald-700">${c.fee}.00</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: POST A GIG (WITH AI GENERATOR) */}
      {showPostGigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0077B6]" />
                <h3 className="font-bold text-slate-900 text-base">Create Dental Gig Opportunity</h3>
              </div>
              <button onClick={() => setShowPostGigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Generator Panel */}
            <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0077B6] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Gig Description Generator
                </span>
                <button
                  type="button"
                  onClick={handleAiGenerateGig}
                  disabled={isGeneratingGigAI}
                  className="px-3 py-1 bg-[#0077B6] text-white rounded-lg text-[11px] font-bold hover:bg-[#0077B6]/90 transition-colors flex items-center gap-1"
                >
                  {isGeneratingGigAI ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate with Gemini'}
                </button>
              </div>
              <p className="text-[11px] text-blue-900">
                Enter your practice name and scope below, then click Generate for instant market-aligned rate & requirements.
              </p>
            </div>

            <form onSubmit={handleCreateGigSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Type</label>
                  <select
                    value={gigRoleType}
                    onChange={e => setGigRoleType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Teledentistry">Teledentistry</option>
                    <option value="Freelance">Freelance CAD Staging</option>
                    <option value="Insurance">Insurance Claims Audit</option>
                    <option value="AI Review">Dental AI Annotation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hourly Budget (USD)</label>
                  <input
                    type="number"
                    value={gigHourlyRate}
                    onChange={e => setGigHourlyRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Practice / Clinic Name</label>
                <input
                  type="text"
                  required
                  value={gigPracticeName}
                  onChange={e => setGigPracticeName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={gigTitle}
                  onChange={e => setGigTitle(e.target.value)}
                  placeholder="e.g. Remote Teledentistry Specialist (Evening Coverage)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Scope / Summary</label>
                <textarea
                  rows={2}
                  required
                  value={gigDescription}
                  onChange={e => setGigDescription(e.target.value)}
                  placeholder="Describe patient consult scope, schedule, and deliverables..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Qualifications & Requirements (One per line)</label>
                <textarea
                  rows={2}
                  value={gigRequirements}
                  onChange={e => setGigRequirements(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostGigModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGig}
                  className="px-5 py-2 bg-[#0077B6] hover:bg-[#0077B6]/90 text-white rounded-xl font-bold flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Dispatch Teledentistry Patient Case</h3>
              </div>
              <button onClick={() => setShowDispatchConsultModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchConsultSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="e.g. Jessica Miller"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={consultUrgency}
                    onChange={e => setConsultUrgency(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent (24h)</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Case Type</label>
                  <select
                    value={consultCaseType}
                    onChange={e => setConsultCaseType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Telediagnostic Second Opinion">Telediagnostic 2nd Opinion</option>
                    <option value="Clear Aligner Staging">Clear Aligner Staging</option>
                    <option value="Emergency Triage">Emergency Triage</option>
                    <option value="Radiology Review">Radiology Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Complaint *</label>
                <textarea
                  rows={2}
                  required
                  value={chiefComplaint}
                  onChange={e => setChiefComplaint(e.target.value)}
                  placeholder="Describe localized pain, swelling, tooth number, or aligner issue..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Symptoms (Comma-separated)</label>
                <input
                  type="text"
                  value={symptomsInput}
                  onChange={e => setSymptomsInput(e.target.value)}
                  placeholder="Lingering cold pain, Mastication discomfort, Bleeding"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Disbursement Fee (USD)</label>
                <input
                  type="number"
                  value={consultFee}
                  onChange={e => setConsultFee(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchConsultModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {isDispatching && <Loader2 className="w-4 h-4 animate-spin" />}
                  Dispatch Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

