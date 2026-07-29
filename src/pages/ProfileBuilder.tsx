import React, { useState } from 'react';
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
  Clock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Loader2, 
  ShieldCheck,
  UserCheck,
  Briefcase
} from 'lucide-react';
import DentistLayout from '../components/DentistLayout';

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
  const [availability, setAvailability] = useState(profile?.availability || 'Part-Time Remote (10-20 hrs/wk)');

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
    } catch (err: any) {
      console.error(err);
      showToast('Error saving profile. Please check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const completionPercent = calculateCompletion();

  return (
    <DentistLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#001D32] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#0077B6]" />
          <p className="text-xs font-bold tracking-tight uppercase font-label">{toastMessage}</p>
        </div>
      )}

      {/* Banner Section */}
      <div className="mb-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-[#0077B6] tracking-widest uppercase bg-[#0077B6]/10 px-3 py-1 rounded-full">
              Practitioner Qualification Engine
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-headline mt-2">
              Clinical Qualification Profile
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Showcase your clinical background, dental specialties, and contact availability to land top-tier teledentistry & consulting gigs.
            </p>
          </div>

          {/* Completion Badge */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 shrink-0">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-slate-100" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-[#0077B6]" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * completionPercent) / 100} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800">{completionPercent}%</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Score</p>
              <p className="text-sm font-bold text-slate-800">
                {completionPercent >= 80 ? 'Optimal Visibility' : 'Needs Qualifications'}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeStep === 1
                ? 'bg-white text-[#0077B6] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" /> 1. Contact & Bio
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeStep === 2
                ? 'bg-white text-[#0077B6] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> 2. Education
          </button>
          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeStep === 3
                ? 'bg-white text-[#0077B6] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> 3. Specialty
          </button>
          <button
            onClick={() => setActiveStep(4)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
              activeStep === 4
                ? 'bg-white text-[#0077B6] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 4. Licensure
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Step Body */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800 font-headline flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#0077B6]" /> Basic Details & Contact Info
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Provide your primary contact coordinates and a professional summary.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Dr. Sarah Jenkins, DDS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-10 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Primary Location / State
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-10 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Current Clinic or Hospital Affiliation (Optional)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="e.g., Pacific Dental Specialists"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-10 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Executive Bio & Clinical Summary
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Highlight your clinical philosophy, years in patient care, experience with digital workflows or clear aligner reviews..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800 font-headline flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#0077B6]" /> Academic Background & Qualifications
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Detail your dental degree, alma mater, and years of clinical practice.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Primary Dental Degree
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none font-medium"
                  >
                    {DEGREE_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Dental School / University Name
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g., UCSF School of Dentistry / Harvard School of Dental Medicine"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      min="1970"
                      max="2026"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="e.g., 2018"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Years of Clinical Experience
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none font-medium"
                    >
                      <option value="1-3 years">1-3 years (Junior Practitioner)</option>
                      <option value="3-5 years">3-5 years (Mid-Level)</option>
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
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800 font-headline flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#0077B6]" /> Specialty & Sub-Specializations
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Define your primary clinical domain and select certified focus skills.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Primary Clinical Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none font-medium"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
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
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-[#0077B6] text-white border-[#0077B6] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Preferred Consulting Availability
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none font-medium"
                  >
                    {AVAILABILITY_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800 font-headline flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0077B6]" /> Licensure & Board Sync
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your license info to automatically qualify for restricted remote gig opportunities.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Issuing State Board
                    </label>
                    <select
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none font-medium"
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
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Dental License Number
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g., DDS-948271"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#0077B6] focus:bg-white outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start gap-4">
                  <div className="p-2 bg-[#0077B6]/10 text-[#0077B6] rounded-lg shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Verification Status</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {profile?.onboardingComplete ? (
                        <span className="text-teal-600 font-bold flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-4 h-4" /> Board credentials verified and synced.
                        </span>
                      ) : (
                        'Your state board license will be cross-referenced with public registry databases upon submitting.'
                      )}
                    </p>
                    {!profile?.onboardingComplete && (
                      <Link
                        to="/verification"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0077B6] mt-3 hover:underline uppercase tracking-wider"
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
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 1) as any)}
              disabled={activeStep === 1}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  handleSave(false);
                  setActiveStep((prev) => Math.min(prev + 1, 4) as any);
                }}
                className="px-6 py-2.5 bg-[#0077B6] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#0077B6]/90 transition-all flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-br from-[#0077B6] to-[#014F86] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-[1.01] transition-all flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Finish & View Gigs
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077B6] bg-[#0077B6]/20 px-2.5 py-1 rounded-md">
                  Employer View Preview
                </span>
                <span className="flex items-center gap-1 text-[11px] text-teal-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Listing
                </span>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden ring-2 ring-[#0077B6] shrink-0">
                  <img
                    src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white font-headline">
                    {fullName || 'Dr. Practitioner Name'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{specialty}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {location || 'Location Not Specified'}
                  </p>
                </div>
              </div>

              {/* Qualification details */}
              <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl text-xs border border-slate-700/50 mb-6">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Degree & Alma Mater:</span>
                  <span className="font-semibold text-white">{degree.split(' ')[0]} {institution ? `• ${institution}` : ''}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-semibold text-white">{experience}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Availability:</span>
                  <span className="font-semibold text-teal-400">{availability.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">State Registry:</span>
                  <span className="font-semibold text-white font-mono">{licenseState} ({licenseNumber || 'Pending'})</span>
                </div>
              </div>

              {/* Sub-specialties tags */}
              <div className="mb-6">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Verified Competencies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {subSpecialties.length > 0 ? (
                    subSpecialties.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-[#0077B6]/20 text-[#0077B6] font-bold px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500">No tags selected</span>
                  )}
                </div>
              </div>

              {bio && (
                <p className="text-xs text-slate-300 italic line-clamp-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/30">
                  "{bio}"
                </p>
              )}
            </div>

            {/* Tips Card */}
            <div className="mt-4 bg-teal-50 border border-teal-200 p-4 rounded-xl text-xs text-teal-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pro-Tip for Dental Consultants</p>
                <p className="text-teal-800 mt-0.5 leading-relaxed">
                  Dentists with complete qualifications, institution records, and clear aligner skills receive up to 3x more remote consult invites from corporate partners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DentistLayout>
  );
}
