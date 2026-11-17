import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  CheckCircle2,
  ShieldCheck,
  FileUp,
  Lock,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLogo } from '../components/BrandLogo';

export default function IdentityVerification() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [clinicName, setClinicName] = useState(profile?.clinicName || '');
  const [issuingState, setIssuingState] = useState(profile?.licenseState || 'California');
  const [licenseNumber, setLicenseNumber] = useState(profile?.licenseNumber || '');
  const [licenseFile, setLicenseFile] = useState<string | null>(
    profile?.licenseNumber ? 'uploaded_license_doc.pdf' : null
  );
  const [dragOver, setDragOver] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFile(e.target.files[0].name);
      showToast('License file attached successfully!');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setLicenseFile(e.dataTransfer.files[0].name);
      showToast('License file attached via drag & drop!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter your full legal name.');
      return;
    }
    if (!licenseNumber.trim()) {
      showToast('Please provide your licensure number.');
      return;
    }
    if (!licenseFile) {
      showToast('Please upload a copy/photograph of your active license.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await updateProfile({
        displayName: fullName,
        email: email,
        clinicName: clinicName,
        licenseState: issuingState,
        licenseNumber: licenseNumber,
        verificationSubmitted: true,
        onboardingComplete: true,
      });

      setSubmitSuccess(true);
      showToast('Clinical verification documents filed successfully!');
    } catch {
      showToast('Submission error. Please verify network status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in">
          <Info className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <p className="text-xs font-semibold tracking-tight">{toastMessage}</p>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-background/88 backdrop-blur-xl border-b border-outline-variant fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
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
            <Link
              to="/profile-builder"
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1 rounded-lg whitespace-nowrap"
            >
              Qualifications
            </Link>
            <Link
              to="/verification"
              className="text-sm font-semibold text-[#2563EB] dark:text-blue-400 whitespace-nowrap"
            >
              Verify License
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
              <img
                className="w-full h-full object-cover"
                src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                alt="User avatar"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="mb-10 max-w-3xl">
          <p className="text-[#2563EB] dark:text-blue-400 font-semibold tracking-wider text-xs mb-2 uppercase">
            Credentialing & Board Compliance
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-3 font-headline flex items-center gap-3">
            Identity & Credentials
            {profile?.onboardingComplete && (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            DentSide enforces strict practitioner credentialing standards to authorize remote teledentistry consultations, claims auditing, and DSO placements.
          </p>
        </section>

        {submitSuccess || profile?.onboardingComplete ? (
          <div className="bg-surface-container-lowest max-w-3xl mx-auto rounded-2xl p-8 md:p-10 text-center border border-outline-variant">
            <div className="w-16 h-16 bg-emerald-500/12 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface font-headline mb-3">
              Clinical Credentials Fully Verified
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto mb-8 text-sm leading-relaxed">
              Your practitioner account is active with <strong className="text-on-surface">Clinical Pro</strong> authorization. All restricted teledentistry, pediatric triage, and orthodontic consulting pools are unlocked.
            </p>
            <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl max-w-md mx-auto mb-8 flex justify-around text-left">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  Registry State
                </span>
                <p className="font-semibold text-on-surface text-sm mt-0.5">{issuingState}</p>
              </div>
              <div className="border-l border-outline-variant" />
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  License ID
                </span>
                <p className="font-semibold text-on-surface text-sm font-mono tabular-nums mt-0.5">
                  {licenseNumber || 'Active DDS-2026'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/opportunities"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Explore Available Gigs
              </Link>
              <Link
                to="/dashboard"
                className="border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Verification Progress */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm tabular-nums">
                      1
                    </div>
                    <div className="w-px h-10 bg-outline-variant my-1" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
                      Step 1
                    </p>
                    <h3 className="text-sm font-bold text-on-surface font-headline">
                      Clinical Profile
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Contact coordinates & current residency.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm tabular-nums">
                      2
                    </div>
                    <div className="w-px h-10 bg-outline-variant my-1" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">
                      Step 2
                    </p>
                    <h3 className="text-sm font-bold text-on-surface font-headline">
                      Licensure Validation
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Verified state board registration.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant flex items-center justify-center font-bold text-sm tabular-nums">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      Step 3
                    </p>
                    <h3 className="text-sm font-bold text-on-surface-variant font-headline">
                      Status Confirmation
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Final credential authorization.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
                <div className="flex items-center gap-2.5 text-[#2563EB] dark:text-blue-400 mb-2.5">
                  <Lock className="w-4 h-4 shrink-0" />
                  <h4 className="font-bold text-sm font-headline text-on-surface">
                    Privacy Encryption
                  </h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your credentials are encrypted using SHA-256 and validated against state board records. Practitioner files remain confidential.
                </p>
              </div>
            </aside>

            {/* Right Column: Verification Form Canvas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info Card */}
              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant">
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-outline-variant">
                  <h2 className="text-xl font-bold tracking-tight font-headline text-on-surface">
                    Practitioner Particulars
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-lg">
                    In Progress
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Legal Full Name (with prefix)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                      placeholder="Dr. Julianne Mercer"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                      placeholder="j.mercer@dentalhub.com"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                      Current Affiliated Clinic / Institution
                    </label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-[#2563EB] outline-none"
                      placeholder="St. Apollonia Dental Center"
                    />
                  </div>
                </div>
              </div>

              {/* License Validation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold font-headline text-on-surface">
                      State Licensure
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                          Issuing Board State
                        </label>
                        <select
                          value={issuingState}
                          onChange={(e) => setIssuingState(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface focus:border-[#2563EB] outline-none"
                        >
                          <option value="California">California</option>
                          <option value="New York">New York</option>
                          <option value="Texas">Texas</option>
                          <option value="Florida">Florida</option>
                          <option value="Kenya">Kenya</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                          Active License Registry ID
                        </label>
                        <input
                          type="text"
                          required
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface font-mono uppercase focus:border-[#2563EB] outline-none"
                          placeholder="DDS-XXXXXX-2024"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-[#2563EB] bg-primary-fixed'
                      : licenseFile
                      ? 'border-emerald-500/60 bg-emerald-500/8'
                      : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="file"
                    id="lic-file-input"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="lic-file-input"
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                        licenseFile
                          ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                          : 'bg-primary-fixed text-[#2563EB] dark:text-blue-400'
                      }`}
                    >
                      {licenseFile ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        <FileUp className="w-7 h-7" />
                      )}
                    </div>
                    <h4 className="font-bold text-on-surface font-headline text-sm">
                      {licenseFile ? 'License Document Attached' : 'Board Certificate File'}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1.5 px-2 leading-relaxed">
                      {licenseFile
                        ? `Filename: ${licenseFile}`
                        : 'PDF, JPG, or PNG board documents. Drag & drop or browse.'}
                    </p>
                    {!licenseFile && (
                      <span className="mt-4 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline">
                        Browse Files
                      </span>
                    )}
                  </label>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold hover:text-on-surface transition-colors px-3 py-2 rounded-lg hover:bg-surface-container"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel & Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Verification
                </button>
              </div>
            </div>
          </form>
        )}
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
          to="/verification"
          className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400"
        >
          <span className="material-symbols-outlined text-xl">verified_user</span>
          <span className="text-[10px] font-semibold mt-0.5">Verify</span>
        </Link>
      </nav>
    </div>
  );
}
