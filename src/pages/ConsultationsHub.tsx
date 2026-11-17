import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Loader2,
  ArrowLeft,
  Search,
  DollarSign,
  Building2,
  ZoomIn,
  ZoomOut,
  Contrast,
  RotateCcw,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandMark } from '../components/BrandLogo';

interface ConsultationCase {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  symptoms: string[];
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  caseType:
    | 'Orthodontic Review'
    | 'Clear Aligner Staging'
    | 'Telediagnostic Second Opinion'
    | 'Radiology Review'
    | 'Emergency Triage';
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
  const { profile, apiFetch } = useAuth();

  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<ConsultationCase | null>(null);

  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Radiograph viewer controls
  const [scanZoom, setScanZoom] = useState<number>(1);
  const [invertScan, setInvertScan] = useState<boolean>(false);

  // Clinical SOAP Form State
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');
  const [cdtCodesInput, setCdtCodesInput] = useState('');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/consultations');
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      } else {
        showToast('Error loading consultation queue.');
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
      showToast('Error loading live consultation queue.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleSelectCase = (c: ConsultationCase) => {
    setSelectedCase(c);
    setAiReport(null);
    setScanZoom(1);
    setInvertScan(false);
    if (c.clinicalDiagnosis) {
      setSoapSubjective(c.clinicalDiagnosis.soapSubjective || '');
      setSoapObjective(c.clinicalDiagnosis.soapObjective || '');
      setSoapAssessment(c.clinicalDiagnosis.soapAssessment || '');
      setSoapPlan(c.clinicalDiagnosis.soapPlan || '');
      setCdtCodesInput(c.clinicalDiagnosis.cdtCodes?.join(', ') || '');
      setRiskLevel(c.clinicalDiagnosis.riskLevel || 'Moderate');
      setClinicalNotes(c.clinicalDiagnosis.notes || '');
    } else {
      setSoapSubjective(
        `Patient ${c.patientName}, ${c.patientAge}yo ${c.patientGender}, presents with chief complaint: "${c.chiefComplaint}". Reported symptoms include ${c.symptoms.join(', ')}.`
      );
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
      const res = await apiFetch('/api/ai/clinical-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chiefComplaint: selectedCase.chiefComplaint,
          symptoms: selectedCase.symptoms,
          patientAge: selectedCase.patientAge,
          caseType: selectedCase.caseType,
          clinicalNotes: soapSubjective,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI clinical assist failed');
      }

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
      showToast(err.message || 'Could not generate AI diagnostic report.');
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
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await apiFetch(`/api/consultations/${selectedCase.id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistName: profile?.displayName || 'Dr. Sarah Jenkins, DDS',
          soapSubjective,
          soapObjective,
          soapAssessment,
          soapPlan,
          cdtCodes,
          riskLevel,
          notes: clinicalNotes,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to submit diagnosis');
      }

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

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || c.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background font-body text-on-surface flex flex-col pb-24 md:pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in text-sm">
          <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-background/88 backdrop-blur-xl border-b border-outline-variant sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard" className="shrink-0" aria-label="DentSide Dashboard">
                <BrandMark size={32} />
              </Link>
              <div>
                <h1 className="font-bold font-headline text-on-surface leading-tight">
                  Teledentistry Consultations Hub
                </h1>
                <p className="text-[11px] text-on-surface-variant font-medium hidden sm:block">
                  Digital Triage · Radiographic Review · AI SOAP Diagnostics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/opportunities"
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors hidden sm:block"
            >
              Browse Gigs
            </Link>
            <Link
              to="/wallet"
              className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> Wallet
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Triage Queue & Filters */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search patient, symptoms, clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-on-surface-variant font-semibold uppercase text-[10px]">Urgency:</span>
                {['All', 'Emergency', 'Urgent', 'Routine'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrgencyFilter(u)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                      urgencyFilter === u
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-on-surface-variant font-semibold uppercase text-[10px]">Status:</span>
                {['All', 'Pending Review', 'In Progress', 'Completed'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors shrink-0 ${
                      statusFilter === s
                        ? 'bg-on-surface text-background'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant tabular-nums">
                  Active Teledental Queue ({filteredCases.length})
                </span>
                <span className="text-[11px] font-semibold text-[#2563EB] dark:text-blue-400">
                  Live Queue
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto mb-2" />
                  <p className="text-xs text-on-surface-variant">Loading cases...</p>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant text-on-surface-variant text-sm">
                  No cases found matching your criteria.
                </div>
              ) : (
                filteredCases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const isCompleted = c.status === 'Completed';

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCase(c)}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer bg-surface-container-lowest ${
                        isSelected
                          ? 'border-[#2563EB] ring-1 ring-[#2563EB]'
                          : 'border-outline-variant hover:border-on-surface-variant/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface text-sm">
                              {c.patientName}
                            </span>
                            <span className="text-xs text-on-surface-variant tabular-nums">
                              ({c.patientAge}y, {c.patientGender})
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#2563EB] dark:text-blue-400">
                            {c.caseType}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +${c.fee}
                          </span>
                          <div className="mt-1">
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                c.urgency === 'Emergency'
                                  ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                  : c.urgency === 'Urgent'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                  : 'bg-surface-container text-on-surface-variant'
                              }`}
                            >
                              {c.urgency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 bg-surface-container-low p-2.5 rounded-lg">
                        {c.chiefComplaint}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant border-t border-outline-variant pt-2.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3" /> {c.clientName}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          {isCompleted ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Reviewed
                            </span>
                          ) : (
                            <span className="text-[#2563EB] dark:text-blue-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {c.status}
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

          {/* Right Column: Case Clinical Examination & SOAP Generator */}
          <div className="lg:col-span-7">
            {selectedCase ? (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-outline-variant">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold font-headline text-on-surface">
                        {selectedCase.patientName}
                      </h2>
                      <span
                        className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-md ${
                          selectedCase.urgency === 'Emergency'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                            : selectedCase.urgency === 'Urgent'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {selectedCase.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Case #{selectedCase.id} · {selectedCase.caseType} · Dispatched by{' '}
                      {selectedCase.clientName}
                    </p>
                  </div>

                  <button
                    onClick={handleRunAiClinicalAssist}
                    disabled={isAiAnalyzing}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
                  >
                    {isAiAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI Clinical Decision Support
                  </button>
                </div>

                {/* Patient Case Overview + Interactive Scan Viewer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                    <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                      Chief Complaint
                    </h3>
                    <p className="text-sm font-medium text-on-surface leading-relaxed">
                      "{selectedCase.chiefComplaint}"
                    </p>
                    <p className="mt-3 text-xs text-on-surface-variant leading-relaxed">
                      {selectedCase.symptoms.join(' · ')}
                    </p>
                  </div>

                  <div className="bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden relative min-h-[168px] flex items-center justify-center">
                    {selectedCase.scanImageUrl ? (
                      <img
                        src={selectedCase.scanImageUrl}
                        alt="Dental Intraoral Scan"
                        style={{
                          transform: `scale(${scanZoom})`,
                          filter: invertScan ? 'invert(1) contrast(1.2)' : 'none',
                        }}
                        className="w-full h-48 object-cover transition-transform duration-200"
                      />
                    ) : (
                      <div className="text-center p-6 text-neutral-400">
                        <FileText className="w-8 h-8 mx-auto mb-1 text-neutral-500" />
                        <span className="text-xs font-medium">Digital Intraoral Scan Attached</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setScanZoom((z) => Math.min(z + 0.25, 2.5))}
                        className="p-1 text-white hover:text-blue-400"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanZoom((z) => Math.max(z - 0.25, 1))}
                        className="p-1 text-white hover:text-blue-400"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvertScan((v) => !v)}
                        className={`p-1 ${invertScan ? 'text-blue-400' : 'text-white'} hover:text-blue-400`}
                        title="Invert Contrast"
                      >
                        <Contrast className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setScanZoom(1);
                          setInvertScan(false);
                        }}
                        className="p-1 text-white hover:text-blue-400"
                        title="Reset View"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-md font-mono tabular-nums">
                      Scan #{selectedCase.id} · {Math.round(scanZoom * 100)}%
                    </span>
                  </div>
                </div>

                {aiReport && (
                  <div className="bg-primary-fixed p-4 rounded-xl border border-[#2563EB]/25 space-y-3">
                    <div className="flex items-center gap-2 text-[#2563EB] dark:text-blue-400 font-semibold text-xs">
                      <Sparkles className="w-4 h-4" /> AI Teledentistry Diagnostic Insights
                    </div>
                    {aiReport.differentialDiagnosis && (
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-on-surface-variant">
                          Differential Diagnoses:
                        </span>
                        <p className="text-xs font-semibold text-on-surface mt-1">
                          {aiReport.differentialDiagnosis.join(' · ')}
                        </p>
                      </div>
                    )}
                    {aiReport.redFlags && aiReport.redFlags.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-200 bg-amber-500/12 p-2.5 rounded-lg border border-amber-500/30">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <span className="font-bold">Clinical Red Flags:</span>{' '}
                          {aiReport.redFlags.join(' · ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmitDiagnosis} className="space-y-4 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                      SOAP Clinical Notes & CDT Diagnostic Coding
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-on-surface-variant font-medium mr-1">Risk:</span>
                      {(['Low', 'Moderate', 'High'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRiskLevel(lvl)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            riskLevel === lvl
                              ? lvl === 'High'
                                ? 'bg-red-600 text-white'
                                : lvl === 'Moderate'
                                ? 'bg-amber-600 text-white'
                                : 'bg-emerald-600 text-white'
                              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        S - Subjective History
                      </label>
                      <textarea
                        rows={2}
                        value={soapSubjective}
                        onChange={(e) => setSoapSubjective(e.target.value)}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-xl bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
                        placeholder="Patient symptoms, onset, pain scale..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        O - Objective Scan Findings
                      </label>
                      <textarea
                        rows={2}
                        value={soapObjective}
                        onChange={(e) => setSoapObjective(e.target.value)}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-xl bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
                        placeholder="Radiographic findings, alignment assessment..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        A - Clinical Assessment / Diagnosis *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={soapAssessment}
                        onChange={(e) => setSoapAssessment(e.target.value)}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-xl bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
                        placeholder="Diagnosis (e.g. Irreversible Pulpitis, Class II Div 1 Malocclusion)..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                        P - Treatment Plan & Advice *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={soapPlan}
                        onChange={(e) => setSoapPlan(e.target.value)}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-xl bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden"
                        placeholder="Recommended in-person care, staging modification, palliative meds..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      CDT Billing Codes (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={cdtCodesInput}
                      onChange={(e) => setCdtCodesInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-outline-variant rounded-xl bg-surface-container-low text-on-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-[#2563EB] focus:outline-hidden font-mono"
                      placeholder="D0140 (Problem-focused exam), D0220 (Periapical 1st film)"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-outline-variant">
                    <div className="text-xs text-on-surface-variant">
                      Disbursement Fee:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                        ${selectedCase.fee}.00 USD
                      </strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDiagnosis || selectedCase.status === 'Completed'}
                      className={`px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-2 ${
                        selectedCase.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 cursor-default'
                          : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
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
              <div className="bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant p-12 text-center">
                <Stethoscope className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                <h3 className="text-base font-bold text-on-surface mb-1">
                  Select a Teledentistry Case
                </h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Select a patient file from the queue to review scans, run AI diagnostic assistance, and submit SOAP consultation notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
