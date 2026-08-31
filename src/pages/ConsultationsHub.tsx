import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  Building2,
  Calendar,
  X
} from 'lucide-react';

interface ConsultationCase {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  symptoms: string[];
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  caseType: 'Orthodontic Review' | 'Clear Aligner Staging' | 'Telediagnostic Second Opinion' | 'Radiology Review' | 'Emergency Triage';
  scanImageUrl?: string;
  status: 'Pending Review' | 'In Progress' | 'Completed';
  dentistId?: string;
  dentistName?: string;
  clientId: string;
  clientName: string;
  fee: number;
  createdAt: string;
  clinicalDiagnosis?: {
    soapSubjective?: string;
    soapObjective?: string;
    soapAssessment?: string;
    soapPlan?: string;
    cdtCodes?: string[];
    riskLevel?: 'Low' | 'Moderate' | 'High';
    notes?: string;
    completedAt?: string;
  };
}

export default function ConsultationsHub() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<ConsultationCase | null>(null);
  
  // Filter states
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Clinical SOAP Form State
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');
  const [cdtCodesInput, setCdtCodesInput] = useState('');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // AI Assist State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/consultations');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
      showToast('Error loading live consultation queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = (c: ConsultationCase) => {
    setSelectedCase(c);
    setAiReport(null);
    if (c.clinicalDiagnosis) {
      setSoapSubjective(c.clinicalDiagnosis.soapSubjective || '');
      setSoapObjective(c.clinicalDiagnosis.soapObjective || '');
      setSoapAssessment(c.clinicalDiagnosis.soapAssessment || '');
      setSoapPlan(c.clinicalDiagnosis.soapPlan || '');
      setCdtCodesInput(c.clinicalDiagnosis.cdtCodes?.join(', ') || '');
      setRiskLevel(c.clinicalDiagnosis.riskLevel || 'Moderate');
      setClinicalNotes(c.clinicalDiagnosis.notes || '');
    } else {
      setSoapSubjective(`Patient ${c.patientName}, ${c.patientAge}yo ${c.patientGender}, presents with chief complaint: "${c.chiefComplaint}". Reported symptoms include ${c.symptoms.join(', ')}.`);
      setSoapObjective('Intraoral scan / radiographic findings reviewed.');
      setSoapAssessment('');
      setSoapPlan('');
      setCdtCodesInput(c.caseType.includes('Ortho') ? 'D8080, D8670' : 'D0140, D0220');
      setRiskLevel(c.urgency === 'Emergency' ? 'High' : c.urgency === 'Urgent' ? 'Moderate' : 'Low');
      setClinicalNotes('');
    }
  };

  const handleRunAiClinicalAssist = async () => {
    if (!selectedCase) return;
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/clinical-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint: selectedCase.chiefComplaint,
          symptoms: selectedCase.symptoms,
          patientAge: selectedCase.patientAge,
          caseType: selectedCase.caseType,
          clinicalNotes: soapSubjective
        })
      });

      if (!res.ok) throw new Error('AI clinical assist failed');
      const data = await res.json();
      setAiReport(data);

      if (data.soapSuggestion) {
        if (data.soapSuggestion.subjective) setSoapSubjective(data.soapSuggestion.subjective);
        if (data.soapSuggestion.objective) setSoapObjective(data.soapSuggestion.objective);
        if (data.soapSuggestion.assessment) setSoapAssessment(data.soapSuggestion.assessment);
        if (data.soapSuggestion.plan) setSoapPlan(data.soapSuggestion.plan);
      }
      if (data.recommendedCdtCodes && data.recommendedCdtCodes.length > 0) {
        setCdtCodesInput(data.recommendedCdtCodes.join(', '));
      }
      showToast('AI Clinical Decision Support recommendations generated successfully!');
    } catch (err: any) {
      console.error(err);
      showToast('Could not generate AI diagnostic report.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmitDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    if (!soapAssessment.trim() || !soapPlan.trim()) {
      showToast('Please complete the SOAP Assessment and Treatment Plan fields.');
      return;
    }

    setIsSubmittingDiagnosis(true);
    try {
      const cdtCodes = cdtCodesInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/consultations/${selectedCase.id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistId: user?.uid || 'demo_dentist_123',
          dentistName: profile?.displayName || 'Dr. Sarah Jenkins, DDS',
          soapSubjective,
          soapObjective,
          soapAssessment,
          soapPlan,
          cdtCodes,
          riskLevel,
          notes: clinicalNotes
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit diagnosis');
      }

      const responseData = await res.json();
      showToast(`Diagnosis submitted! $${selectedCase.fee}.00 credited to your wallet.`);
      setSelectedCase(responseData.case);
      fetchCases();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error submitting diagnosis.');
    } finally {
      setIsSubmittingDiagnosis(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || c.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col pb-24 md:pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300 text-sm">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-[#0077B6] p-1.5 rounded-lg text-white">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight">Teledentistry Consultations Hub</h1>
                <p className="text-[11px] text-slate-500 font-medium">Digital Triage, Radiographic Review & AI SOAP Diagnostics</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/opportunities"
              className="text-xs font-semibold text-slate-600 hover:text-[#0077B6] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block"
            >
              Browse Gigs
            </Link>
            <Link 
              to="/wallet"
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              <DollarSign className="w-3.5 h-3.5" /> Wallet
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Triage Queue & Filters (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text"
                  placeholder="Search patient, symptoms, clinic..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0077B6]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">Urgency:</span>
                {['All', 'Emergency', 'Urgent', 'Routine'].map(u => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(u)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                      urgencyFilter === u 
                        ? 'bg-[#0077B6] text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases Queue List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Teledental Queue ({filteredCases.length})</span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Case Feed
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0077B6] mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading cases...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No cases found matching your criteria.
                </div>
              ) : (
                filteredCases.map(c => {
                  const isSelected = selectedCase?.id === c.id;
                  const isCompleted = c.status === 'Completed';

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                        isSelected 
                          ? 'border-[#0077B6] ring-2 ring-[#0077B6]/20 shadow-md' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{c.patientName}</span>
                            <span className="text-xs text-slate-400">({c.patientAge}y, {c.patientGender})</span>
                          </div>
                          <span className="text-xs font-semibold text-[#0077B6]">{c.caseType}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            +${c.fee}
                          </span>
                          <div className="mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              c.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                              c.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {c.urgency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg">
                        {c.chiefComplaint}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                        <span className="flex items-center gap-1 font-medium text-slate-500">
                          <Building2 className="w-3 h-3" /> {c.clientName}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          {isCompleted ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Reviewed
                            </span>
                          ) : (
                            <span className="text-[#0077B6] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Case Clinical Examination & SOAP Generator (7 cols) */}
          <div className="lg:col-span-7">
            {selectedCase ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                
                {/* Case Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{selectedCase.patientName}</h2>
                      <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        selectedCase.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                        selectedCase.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedCase.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Case #{selectedCase.id} • {selectedCase.caseType} • Dispatched by {selectedCase.clientName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunAiClinicalAssist}
                      disabled={isAiAnalyzing}
                      className="px-3.5 py-2 bg-gradient-to-r from-[#0077B6] to-[#014F86] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                    >
                      {isAiAnalyzing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                      )}
                      AI Clinical Decision Support
                    </button>
                  </div>
                </div>

                {/* Patient Case Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chief Complaint</h3>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      "{selectedCase.chiefComplaint}"
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {selectedCase.symptoms.map((s, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Radiograph / Intraoral Image */}
                  <div className="bg-slate-900 rounded-xl overflow-hidden relative group min-h-[140px] flex items-center justify-center">
                    {selectedCase.scanImageUrl ? (
                      <img 
                        src={selectedCase.scanImageUrl} 
                        alt="Dental Intraoral Scan"
                        className="w-full h-full object-cover max-h-48 opacity-90 group-hover:opacity-100 transition-opacity" 
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-1 text-slate-500" />
                        <span className="text-xs font-medium">Digital Intraoral Scan Attached</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-semibold">
                      Digital Radiograph #{selectedCase.id}
                    </span>
                  </div>
                </div>

                {/* AI Diagnostic Report Banner (if generated) */}
                {aiReport && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 space-y-3">
                    <div className="flex items-center gap-2 text-[#0077B6] font-bold text-xs">
                      <Sparkles className="w-4 h-4" /> AI Teledentistry Diagnostic Insights
                    </div>
                    {aiReport.differentialDiagnosis && (
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-500">Differential Diagnoses:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {aiReport.differentialDiagnosis.map((d: string, i: number) => (
                            <span key={i} className="bg-white text-indigo-900 px-2 py-0.5 rounded-md text-xs font-semibold border border-indigo-100">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {aiReport.redFlags && aiReport.redFlags.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <span className="font-bold">Clinical Red Flags:</span> {aiReport.redFlags.join(' • ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SOAP Clinical Assessment Form */}
                <form onSubmit={handleSubmitDiagnosis} className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0077B6]" />
                      SOAP Clinical Notes & CDT Diagnostic Coding
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Risk Level:</span>
                      {(['Low', 'Moderate', 'High'] as const).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRiskLevel(lvl)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                            riskLevel === lvl 
                              ? lvl === 'High' ? 'bg-red-600 text-white' : lvl === 'Moderate' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">S - Subjective History</label>
                      <textarea
                        rows={2}
                        value={soapSubjective}
                        onChange={e => setSoapSubjective(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                        placeholder="Patient symptoms, onset, pain scale..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">O - Objective Scan Findings</label>
                      <textarea
                        rows={2}
                        value={soapObjective}
                        onChange={e => setSoapObjective(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                        placeholder="Radiographic findings, alignment assessment..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">A - Clinical Assessment / Diagnosis *</label>
                      <textarea
                        rows={3}
                        required
                        value={soapAssessment}
                        onChange={e => setSoapAssessment(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                        placeholder="Diagnosis (e.g. Irreversible Pulpitis, Class II Div 1 Malocclusion)..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">P - Treatment Plan & Advice *</label>
                      <textarea
                        rows={3}
                        required
                        value={soapPlan}
                        onChange={e => setSoapPlan(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden"
                        placeholder="Recommended in-person care, staging modification, palliative meds..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">CDT Billing Codes (Comma-separated)</label>
                    <input
                      type="text"
                      value={cdtCodesInput}
                      onChange={e => setCdtCodesInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0077B6] focus:outline-hidden font-mono"
                      placeholder="D0140 (Problem-focused exam), D0220 (Periapical 1st film)"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Disbursement Fee: <strong className="text-emerald-700 font-bold">${selectedCase.fee}.00 USD</strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDiagnosis || selectedCase.status === 'Completed'}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 ${
                        selectedCase.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : 'bg-[#0077B6] hover:bg-[#0077B6]/90 text-white active:scale-95'
                      }`}
                    >
                      {isSubmittingDiagnosis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : selectedCase.status === 'Completed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Consultation Completed
                        </>
                      ) : (
                        'Sign & Complete Consultation'
                      )}
                    </button>
                  </div>
                </form>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Select a Teledentistry Case</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click on any patient file from the left queue to review clinical scans, run AI diagnostic assistance, and submit SOAP consultation notes.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
