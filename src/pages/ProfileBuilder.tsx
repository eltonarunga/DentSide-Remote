import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Stethoscope,
  Phone,
  MapPin,
  Building,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLogo } from '../components/BrandLogo';

const SPECIALTIES = [
  'General Dentistry',
  'Orthodontics',
  'Teledentistry & Remote Consults',
  'Endodontics',
  'Periodontics',
  'Pediatric Dentistry',
  'Prosthodontics',
  'Oral & Maxillofacial Surgery',
  'Dental Radiology / AI Review',
];

const SUB_SPECIALTIES_OPTIONS = [
  'Invisalign Certified',
  'iTero Scanning',
  'Clear Aligners',
  'Dental AI Diagnostics',
  'Emergency Consultations',
  'Implants & Restorative',
  'Cosmetic Dentistry',
  'Pediatric Triage',
  'CBCT / Radiology Review',
  'Insurance Claims Auditing',
];

const DEGREE_OPTIONS = [
  'DDS (Doctor of Dental Surgery)',
  'DMD (Doctor of Medicine in Dentistry)',
  'BDS (Bachelor of Dental Surgery)',
  'MDS (Master of Dental Surgery)',
  'MS in Dentistry / Oral Sciences',
  'PhD in Dental Medicine',
];

const AVAILABILITY_OPTIONS = [
  'Full-Time Remote (30+ hrs/wk)',
  'Part-Time Remote (10-20 hrs/wk)',
  'Evenings & Weekends Only',
  'On-Demand / Emergency Calls',
  'Project-Based / AI Review',
];

export default function ProfileBuilder() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [location, setLocation] = useState(profile?.location || 'California, USA');
  const [clinicName, setClinicName] = useState(profile?.clinicName || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const [degree, setDegree] = useState(profile?.degree || 'DDS (Doctor of Dental Surgery)');
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [graduationYear, setGraduationYear] = useState(profile?.graduationYear || '2018');
  const [experience, setExperience] = useState(profile?.experience || '5-8 years');

  const [specialty, setSpecialty] = useState(profile?.specialty || 'General Dentistry');
  const [subSpecialties, setSubSpecialties] = useState<string[]>(
    profile?.subSpecialties || ['Invisalign Certified', 'Dental AI Diagnostics']
  );
  const [availability, setAvailability] = useState(
    profile?.availability || 'Part-Time Remote (10-20 hrs/wk)'
  );

  const [licenseNumber, setLicenseNumber] = useState(profile?.licenseNumber || '');
  const [licenseState, setLicenseState] = useState(profile?.licenseState || 'California');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSubSpecialty = (item: string) => {
    if (subSpecialties.includes(item)) {
      setSubSpecialties(subSpecialties.filter((s) => s !== item));
    } else {
      if (subSpecialties.length >= 6) {
        showToast('Maximum 6 focus skills allowed.');
        return;
      }
      setSubSpecialties([...subSpecialties, item]);
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (fullName) score += 15;
    if (phoneNumber) score += 10;
    if (location) score += 10;
    if (bio) score += 15;
    if (degree && institution) score += 20;
    if (specialty) score += 15;
    if (licenseNumber) score += 15;
    return score;
  };

  const handleSave = async (redirectOnSuccess = false) => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: fullName,
        phoneNumber,
        location,
        clinicName,
        bio,
        degree,
        institution,
        graduationYear,
        experience,
        specialty,
        subSpecialties,
        availability,
        licenseNumber,
        licenseState,
        profileCompleted: true,
      });

      showToast('Profile qualifications saved successfully!');
      if (redirectOnSuccess) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving profile. Please check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const completionPercent = calculateCompletion();

  return (
    <div className="bg-background text-on-surface min-h-screen font-body relative pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <p className="text-xs font-semibold tracking-tight">{toastMessage}</p>
        </div>
      )}

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-background/88 backdrop-blur-xl border-b border-outline-variant h-16 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BrandLogo to="/dashboard" size={30} />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Dashboard
          </Link>
          <Link
            to="/opportunities"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Gigs
          </Link>
          <Link
            to="/consultations"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Teledentistry
          </Link>
          <Link
            to="/wallet"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Wallet
          </Link>
          <span className="text-sm font-semibold text-[#2563EB] dark:text-blue-400 whitespace-nowrap">
            Qualifications
          </span>
          <Link
            to="/verification"
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
          >
            Verify License
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Progress
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
            <img
              className="w-full h-full object-cover"
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
              alt="User avatar"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Banner Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 tracking-wider uppercase mb-1.5">
                Practitioner Qualification Engine
              </p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                Clinical Qualification Profile
              </h1>
              <p className="text-on-surface-variant text-sm md:text-base mt-1 max-w-2xl">
                Document your clinical background, dental specialties, and contact availability to qualify for teledentistry and consulting roles.
              </p>
            </div>

            {/* Completion Badge */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant flex items-center gap-4 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-surface-container-high"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-[#2563EB]"
                    fill="transparent"
                    strokeDasharray={125}
                    strokeDashoffset={125 - (125 * completionPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-on-surface tabular-nums">
                  {completionPercent}%
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Profile Score
                </p>
                <p className="text-sm font-bold text-on-surface">
                  {completionPercent >= 80 ? 'Optimal Visibility' : 'Needs Qualifications'}
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-surface-container p-1.5 rounded-2xl border border-outline-variant max-w-4xl">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors ${
                activeStep === 1
                  ? 'bg-surface-container-lowest text-[#2563EB] dark:text-blue-400 border border-outline-variant'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" /> 1. Contact & Bio
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors ${
                activeStep === 2
                  ? 'bg-surface-container-lowest text-[#2563EB] dark:text-blue-400 border border-outline-variant'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" /> 2. Education
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors ${
                activeStep === 3
                  ? 'bg-surface-container-lowest text-[#2563EB] dark:text-blue-400 border border-outline-variant'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Stethoscope className="w-4 h-4 shrink-0" /> 3. Specialty
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors ${
                activeStep === 4
                  ? 'bg-surface-container-lowest text-[#2563EB] dark:text-blue-400 border border-outline-variant'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" /> 4. Licensure
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Step Body */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant space-y-6">
            {activeStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-outline-variant pb-4">
                  <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400" /> Basic Details & Contact Info
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Provide your primary contact coordinates and a professional summary.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Full Name & Title
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Dr. Sarah Jenkins, DDS"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Primary Location / State
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., San Francisco, CA"
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Current Clinic or Hospital Affiliation (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="e.g., Pacific Dental Specialists"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 pl-10 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Executive Bio & Clinical Summary
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Highlight your clinical philosophy, years in patient care, experience with digital workflows or clear aligner reviews..."
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-outline-variant pb-4">
                  <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#2563EB] dark:text-blue-400" /> Academic Background & Qualifications
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Detail your dental degree, alma mater, and years of clinical practice.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Primary Dental Degree
                    </label>
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none font-medium"
                    >
                      {DEGREE_OPTIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Dental School / University Name
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g., UCSF School of Dentistry / Harvard School of Dental Medicine"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        min="1970"
                        max="2026"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        placeholder="e.g., 2018"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Years of Clinical Experience
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none font-medium"
                      >
                        <option value="1-3 years">1-3 years (Junior Practitioner)</option>
                        <option value="3-5 years">3-5 years (Mid-Level)</option>
                        <option value="5-8 years">5-8 years (Senior Practitioner)</option>
                        <option value="5-10 years">5-10 years (Senior Practitioner)</option>
                        <option value="10+ years">10+ years (Expert / Consultant)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-outline-variant pb-4">
                  <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#2563EB] dark:text-blue-400" /> Specialty & Sub-Specializations
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Define your primary clinical domain and select certified focus skills.
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Primary Clinical Specialty
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none font-medium"
                    >
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                      Certifications & Sub-Specialty Focus (Select up to 6)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUB_SPECIALTIES_OPTIONS.map((item) => {
                        const isSelected = subSpecialties.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleSubSpecialty(item)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                              isSelected
                                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Preferred Consulting Availability
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none font-medium"
                    >
                      {AVAILABILITY_OPTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-outline-variant pb-4">
                  <h3 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400" /> Licensure & Board Sync
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Connect your license details to automatically qualify for restricted remote gig opportunities.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Issuing State Board
                      </label>
                      <select
                        value={licenseState}
                        onChange={(e) => setLicenseState(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none font-medium"
                      >
                        <option value="California">California</option>
                        <option value="New York">New York</option>
                        <option value="Texas">Texas</option>
                        <option value="Florida">Florida</option>
                        <option value="Illinois">Illinois</option>
                        <option value="Kenya">Kenya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Dental License Number
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g., DDS-948271"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3.5 text-sm text-on-surface focus:border-[#2563EB] outline-none uppercase font-mono tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant flex items-start gap-4">
                    <div className="p-2.5 bg-primary-fixed text-[#2563EB] dark:text-blue-400 rounded-xl shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Verification Status</h4>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {profile?.onboardingComplete ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                            <CheckCircle2 className="w-4 h-4" /> Board credentials verified and synced.
                          </span>
                        ) : (
                          'Your state board license will be cross-referenced with public registry databases upon submitting.'
                        )}
                      </p>
                      {!profile?.onboardingComplete && (
                        <Link
                          to="/verification"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400 mt-3 hover:underline"
                        >
                          Upload Official Certificate <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4)}
                disabled={activeStep === 1}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container disabled:opacity-35 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSave(false);
                    setActiveStep((prev) => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
                  }}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="px-7 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Finish & View Gigs
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="lg:col-span-5 space-y-5">
            <div className="sticky top-24 space-y-4">
              <div className="bg-[#111111] dark:bg-surface-container-lowest text-white p-6 rounded-2xl border border-[#27272A]">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                    Employer View Preview
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Listing
                  </span>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-[#18181B] overflow-hidden ring-2 ring-[#2563EB] shrink-0">
                    <img
                      src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white font-headline">
                      {fullName || 'Dr. Practitioner Name'}
                    </h3>
                    <p className="text-xs text-gray-300 font-medium">{specialty}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {location || 'Location Not Specified'}
                    </p>
                  </div>
                </div>

                {/* Qualification details */}
                <div className="space-y-3 bg-[#18181B] dark:bg-surface-container-low p-4 rounded-xl text-xs border border-[#27272A] mb-5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400">Degree & Alma Mater</span>
                    <span className="font-semibold text-white text-right">
                      {degree.split(' ')[0]} {institution ? `· ${institution}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400">Experience</span>
                    <span className="font-semibold text-white tabular-nums">{experience}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400">Availability</span>
                    <span className="font-semibold text-blue-400">{availability.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-400">State Registry</span>
                    <span className="font-semibold text-white font-mono tabular-nums">
                      {licenseState} ({licenseNumber || 'Pending'})
                    </span>
                  </div>
                </div>

                {/* Sub-specialties inline summary */}
                <div className="mb-4">
                  <p className="text-[11px] uppercase font-semibold text-gray-400 tracking-wider mb-1.5">
                    Verified Competencies
                  </p>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    {subSpecialties.length > 0
                      ? subSpecialties.join(' · ')
                      : 'No competencies selected yet'}
                  </p>
                </div>

                {bio && (
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 bg-[#18181B] dark:bg-surface-container-low p-3.5 rounded-xl border border-[#27272A]">
                    &ldquo;{bio}&rdquo;
                  </p>
                )}
              </div>

              {/* Tips Card */}
              <div className="bg-surface-container-low border border-outline-variant p-5 rounded-2xl text-xs text-on-surface flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#2563EB] dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-on-surface">Profile Completion Guidance</p>
                  <p className="text-on-surface-variant mt-1 leading-relaxed">
                    Dentists with complete qualifications, institution records, and clear aligner skills receive up to 3x more remote consult invites from clinic partners.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-outline-variant flex justify-around items-center px-4 h-16">
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[10px] font-medium mt-0.5">Dashboard</span>
        </Link>
        <Link
          to="/opportunities"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">work_outline</span>
          <span className="text-[10px] font-medium mt-0.5">Gigs</span>
        </Link>
        <Link
          to="/consultations"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">medical_services</span>
          <span className="text-[10px] font-medium mt-0.5">Consults</span>
        </Link>
        <Link
          to="/wallet"
          className="flex flex-col items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
          <span className="text-[10px] font-medium mt-0.5">Wallet</span>
        </Link>
        <Link
          to="/profile-builder"
          className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400"
        >
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px] font-semibold mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
