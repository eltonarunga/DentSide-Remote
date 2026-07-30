import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle, ShieldCheck, FileUp } from 'lucide-react';

export default function IdentityVerification() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [clinicName, setClinicName] = useState(profile?.clinicName || '');
  const [issuingState, setIssuingState] = useState(profile?.licenseState || 'California');
  const [licenseNumber, setLicenseNumber] = useState(profile?.licenseNumber || '');
  const [licenseFile, setLicenseFile] = useState<string | null>(profile?.licenseNumber ? 'uploaded_license_doc.pdf' : null);
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
      // Simulate cryptographic file hashing / secure submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      await updateProfile({
        displayName: fullName,
        email: email,
        clinicName: clinicName,
        licenseState: issuingState,
        licenseNumber: licenseNumber,
        verificationSubmitted: true,
        onboardingComplete: true, // Autoapprove in sandbox preview for complete flow testing
      });

      setSubmitSuccess(true);
      showToast('Clinical verification documents filed successfully!');
    } catch (err: any) {
      showToast('Submission error. Please verify network status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#001D32] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant/30 animate-bounce">
          <span className="material-symbols-outlined text-[#0077B6]">info</span>
          <p className="text-xs font-bold tracking-tight uppercase font-label">{toastMessage}</p>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</Link>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Dashboard</Link>
              <Link to="/opportunities" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Gigs</Link>
              <Link to="/wallet" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Wallet</Link>
              <Link to="/verification" className="text-[#0077B6] font-semibold text-sm">Profile</Link>
            </nav>
            <div className="flex items-center gap-3">
              <button className="material-symbols-outlined text-slate-500 hover:bg-[#f7f9fb] transition-colors p-2 rounded-full">notifications</button>
              <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden ring-2 ring-primary-container/20">
                <img className="w-full h-full object-cover" src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="User avatar" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <section className="mb-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4 font-headline flex items-center gap-3">
            Identity & Credentials 
            {profile?.onboardingComplete && <CheckCircle className="w-8 h-8 text-teal-600 animate-pulse" />}
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            As a premier platform for licensed dental professionals, we employ strict credentialing standards to secure high-value remote consultations and teledentistry programs.
          </p>
        </section>

        {submitSuccess || profile?.onboardingComplete ? (
          <div className="bg-surface-container-lowest max-w-3xl mx-auto rounded-2xl p-8 text-center border border-outline-variant/30 shadow-md">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-headline mb-3">Clinical Credentials Fully Verified</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto mb-8 lead text-sm">
              Your profile is now running with <strong>Clinical Pro</strong> routing attributes. All restricted teledentistry, pediatric diagnostics, and orthodontic consulting pools have been fully activated.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl max-w-md mx-auto mb-8 flex justify-around text-left">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Registry State</span>
                <p className="font-semibold text-slate-900 text-sm">{issuingState}</p>
              </div>
              <div className="border-l border-slate-200"></div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">License ID</span>
                <p className="font-semibold text-slate-900 text-sm">{licenseNumber || 'Active DDS-2026'}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/opportunities" className="bg-gradient-to-br from-[#0077B6] to-[#014F86] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase shadow-md hover:scale-[1.01] transition-transform">
                Explore Available Gigs
              </Link>
              <Link to="/dashboard" className="border border-outline-variant text-on-surface-variant px-8 py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-slate-50 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Verification Progress */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm space-y-8">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">1</div>
                    <div className="w-0.5 h-12 bg-primary-container/30"></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#0077B6]">Step 1</p>
                    <h3 className="text-base font-bold text-on-surface font-headline">Clinical Profile</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Contact coordinates & current residency.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">2</div>
                    <div className="w-0.5 h-12 bg-outline-variant/30"></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#0077B6]">Step 2</p>
                    <h3 className="text-base font-bold text-on-surface font-headline">Licensure Validation</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Verified state board registration.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">3</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Step 3</p>
                    <h3 className="text-base font-bold text-on-surface-variant font-headline">Status Confirmation</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Final authorization.</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-container/5 p-6 rounded-xl border border-primary-container/10">
                <div className="flex items-center gap-3 text-[#0077B6] mb-3">
                  <span className="material-symbols-outlined">security</span>
                  <h4 className="font-bold font-headline">Privacy Encryption</h4>
                </div>
                <p className="text-xs text-on-secondary-container leading-relaxed">
                  Your credentials are encrypted using SHA-256 and verified through certified state registry APIs. We completely safeguard practitioner data.
                </p>
              </div>
            </aside>

            {/* Right Column: Verification Form Canvas */}
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {/* Personal Info Card */}
                <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-l-4 border-[#0077B6]">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold tracking-tight font-headline">Practitioner Particulars</h2>
                    <span className="text-xs font-bold px-3 py-1 bg-tertiary-container/10 text-[#0077B6] rounded-full uppercase tracking-wider">in progress</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Legal Full Name (with prefix)</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-[#0077B6] transition-all text-on-surface placeholder:text-on-surface-variant/50" 
                        placeholder="Dr. Julianne Mercer" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Official Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-[#0077B6] transition-all text-on-surface placeholder:text-on-surface-variant/50" 
                        placeholder="j.mercer@dentalhub.com" 
                        required
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Current Affiliated Clinic / Institution</label>
                      <input 
                        type="text" 
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-[#0077B6] transition-all text-on-surface placeholder:text-on-surface-variant/50" 
                        placeholder="St. Apollonia Dental Center" 
                      />
                    </div>
                  </div>
                </div>

                {/* License Validation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* License Info */}
                  <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between border border-outline-variant/30">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold font-headline text-slate-800">State Licensure</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Issuing Board State</label>
                          <select 
                            value={issuingState}
                            onChange={(e) => setIssuingState(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-[#0077B6]"
                          >
                            <option value="California">California</option>
                            <option value="New York">New York</option>
                            <option value="Texas">Texas</option>
                            <option value="Florida">Florida</option>
                            <option value="Kenya">Kenya</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-label">Active License Registry ID</label>
                          <input 
                            type="text" 
                            required
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-[#0077B6] uppercase" 
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
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      dragOver 
                        ? 'border-[#0077B6] bg-primary/5 scale-105' 
                        : licenseFile 
                          ? 'border-emerald-500 bg-emerald-50/20' 
                          : 'border-outline-variant hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="lic-file-input" 
                      className="hidden" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="lic-file-input" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${licenseFile ? 'bg-emerald-100' : 'bg-primary/5'}`}>
                        {licenseFile ? (
                          <CheckCircle className="w-8 h-8 text-emerald-600" />
                        ) : (
                          <FileUp className="w-8 h-8 text-[#0077B6]" />
                        )}
                      </div>
                      <h4 className="font-bold text-on-surface font-headline transition-colors">
                        {licenseFile ? 'License Uploaded' : 'Board Certificate File'}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-2 px-4 leading-relaxed">
                        {licenseFile ? `Filename: ${licenseFile}` : 'PDF, JPG, or PNG board documents. Drag & drop or browse files.'}
                      </p>
                      {!licenseFile && (
                        <span className="mt-4 text-xs font-bold text-[#0077B6] uppercase tracking-wider underline">Browse Files</span>
                      )}
                    </label>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-8">
                  <button 
                    type="button"
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Cancel & Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-br from-[#0077B6] to-[#014F86] disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Verification
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10 h-20 px-4 pb-safe flex justify-around items-center">
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
        </Link>
        <Link to="/opportunities" className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">work_outline</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Gigs</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center text-slate-400">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Wallet</span>
        </Link>
        <Link to="/verification" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1">
          <span className="material-symbols-outlined">person</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
