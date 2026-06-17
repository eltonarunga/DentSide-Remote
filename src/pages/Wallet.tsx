import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, HelpCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  status: 'Completed' | 'Pending';
}

export default function Wallet() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState<number>(profile?.onboardingComplete ? 1250.00 : 0.00);
  const [pending, setPending] = useState<number>(profile?.onboardingComplete ? 450.00 : 0.00);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals / Inputs
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');
  
  const [channel, setChannel] = useState<'stripe' | 'mpesa'>(profile?.payoutChannel || 'stripe');
  
  const [history, setHistory] = useState<Transaction[]>([
    {
      id: 'tx-101',
      type: 'deposit',
      amount: 850.00,
      date: 'May 24, 2026',
      description: 'Teledentistry Consult Settlement - DeltDent Advisory',
      status: 'Completed',
    },
    {
      id: 'tx-102',
      type: 'deposit',
      amount: 400.00,
      date: 'May 20, 2026',
      description: 'Orthodontic Treatment Plan Review',
      status: 'Completed',
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePayoutChannelSelect = async (newChannel: 'stripe' | 'mpesa') => {
    setChannel(newChannel);
    try {
      await updateProfile({ payoutChannel: newChannel });
      triggerToast(`Payout channel switched to ${newChannel === 'stripe' ? 'Stripe Connect' : 'M-Pesa Mobile'}!`);
    } catch {
      triggerToast('Failed to save payout channel selection.');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please specify a positive numeric value.');
      return;
    }
    if (amt > balance) {
      triggerToast('Insufficient funds on your available balance.');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBalance(prev => prev - amt);
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      amount: amt,
      date: 'Today',
      description: `Withdrawal via ${channel === 'stripe' ? 'Stripe Direct' : 'M-Pesa Mobile'}`,
      status: 'Completed',
    };
    
    setHistory(prev => [newTx, ...prev]);
    setIsProcessing(false);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    triggerToast(`Successfully processed withdrawal of $${amt.toFixed(2)}!`);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) {
      triggerToast('Please specify a positive numeric value.');
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setBalance(prev => prev + amt);
    
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      amount: amt,
      date: 'Today',
      description: 'Direct Bank Deposit to Balance Pool',
      status: 'Completed',
    };
    
    setHistory(prev => [newTx, ...prev]);
    setIsProcessing(false);
    setShowAddModal(false);
    setAddAmount('');
    triggerToast(`Added $${amt.toFixed(2)} to your balance pool!`);
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

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</Link>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Dashboard</Link>
              <Link to="/opportunities" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Gigs</Link>
              <Link to="/wallet" className="text-[#0077B6] font-semibold text-sm">Wallet</Link>
              <Link to="/verification" className="text-slate-500 hover:text-[#0077B6] transition-colors font-semibold text-sm">Profile</Link>
            </nav>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500 hover:bg-[#f7f9fb] p-2 rounded-full transition-colors cursor-pointer">notifications</span>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
                <img alt="User avatar" src={profile?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 pl-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Wallet & Earnings</h1>
          <p className="text-on-surface-variant font-body text-lg max-w-2xl leading-relaxed">Securely process medical consultation settlements, route payout channels, and keep compliant financial records.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Financial Balance Status */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#005D90] to-[#001D32] p-8 rounded-xl shadow-lg text-white relative overflow-hidden border border-outline-variant/15">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold text-slate-300 block mb-1">Available Corporate Pool</span>
                    <h2 className="text-5xl font-extrabold tracking-tighter font-headline">${balance.toFixed(2)}</h2>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                    <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-[#0077B6] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#0077B6]/90 shadow-md"
                  >
                    Withdraw Now
                  </button>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:bg-white/20"
                  >
                    Add Test Funds
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#0077B6]/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* Pending Settlements Container */}
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-full min-h-[160px] border border-outline-variant/10 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#0077B6]">schedule</span>
                  <span className="text-slate-500 font-semibold text-sm">Pending Settlements</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-headline">${pending.toFixed(2)}</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Incoming payments currently routing through state board medical compliance cycles.</p>
            </div>

            {/* Next Payout Container */}
            <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between h-full min-h-[160px] border border-outline-variant/10 shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#0077B6]">event_repeat</span>
                  <span className="text-slate-500 font-semibold text-sm">Automated Settlement Route</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-headline">
                  {channel === 'stripe' ? 'Stripe Direct' : 'M-Pesa Direct'}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Direct automated clearing cycle connected securely to your registration.</p>
            </div>

            {/* Transaction Ledger */}
            <div className="md:col-span-2 mt-4">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-2xl font-bold font-headline text-slate-800">Ledger Activity</h3>
                <button 
                  onClick={() => triggerToast(`Exported ${history.length} transactions to clinical statement.`)}
                  className="text-[#0077B6] font-bold text-xs uppercase tracking-wider hover:underline"
                >
                  Export Statement
                </button>
              </div>

              <div className="space-y-3">
                {history.length > 0 ? (
                  history.map((tx) => (
                    <div key={tx.id} className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${tx.type === 'deposit' ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{tx.date} • ID: {tx.id.substring(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-base ${tx.type === 'deposit' ? 'text-teal-600' : 'text-slate-800'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </p>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-teal-600 block mt-0.5">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-surface-container-low p-8 text-center rounded-xl border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt_long</span>
                    <h4 className="font-bold text-lg mb-1 font-headline">No Transactions Yet</h4>
                    <p className="text-on-surface-variant text-sm">Your recent earnings will record here automatically.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Payout Methods Selection */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/20">
              <h3 className="text-xl font-bold mb-6 font-headline text-slate-800">Payout Channels</h3>
              <div className="space-y-4">
                {/* Stripe Channel */}
                <div 
                  onClick={() => handlePayoutChannelSelect('stripe')}
                  className={`relative cursor-pointer border-2 p-4 rounded-xl flex items-center gap-4 transition-all ${
                    channel === 'stripe' ? 'border-[#0077B6] bg-[#0077B6]/5 shadow-xs' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-800">Stripe Connect</p>
                      {channel === 'stripe' && (
                        <span className="material-symbols-outlined text-[#0077B6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">Instant processing. USD/EUR.</p>
                  </div>
                </div>

                {/* M-Pesa Channel */}
                <div 
                  onClick={() => handlePayoutChannelSelect('mpesa')}
                  className={`relative cursor-pointer border-2 p-4 rounded-xl flex items-center gap-4 transition-all ${
                    channel === 'mpesa' ? 'border-[#0077B6] bg-[#0077B6]/5 shadow-xs' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-[#4CAF50] rounded-lg flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">smartphone</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-800">M-Pesa Mobile</p>
                      {channel === 'mpesa' && (
                        <span className="material-symbols-outlined text-[#0077B6]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">Instant mobile wallet. KES/TZS.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => triggerToast('Routing network parameters are active. Standard paths linked.')}
                className="w-full mt-6 flex items-center justify-center gap-2 border border-outline-variant text-[#0077B6] p-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors uppercase tracking-widest border-dashed"
              >
                <Plus className="w-4 h-4" /> Link Backup Account
              </button>
            </section>

            {/* Grade Security */}
            <section className="bg-[#001d32] p-8 rounded-xl text-white relative overflow-hidden shadow-xs">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 text-[#0077B6]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 font-headline">PCI Compliance Certified</h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-6">Financial operations are audited per PCI-DSS Class 1 frameworks. Practitioner payroll settlement files are encrypted using RSA-4096 protocols.</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
                    <span className="material-symbols-outlined text-[#0077B6] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                    Military-Grade Encryption Vault
                  </li>
                  <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
                    <span className="material-symbols-outlined text-[#0077B6] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    Multi-Factor Board Attestation
                  </li>
                </ul>
              </div>
            </section>

            {/* Assistance Card */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1.5 text-slate-800">
                <HelpCircle className="w-4 h-4 text-[#0077B6]" /> Financial Assistance
              </h4>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Our clinical compliance and reconciliation specialists reside on standby 24/7 to clear payment obstacles.</p>
              <a href="mailto:support@dentsideremote.com" className="text-[#0077B6] text-xs font-bold flex items-center gap-1 hover:underline">
                Contact Ledger Support 
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Dialog / Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-up">
            <h3 className="text-xl font-bold font-headline mb-2 text-slate-800">Secure Balance Withdrawal</h3>
            <p className="text-xs text-slate-500 mb-6">Funds will settle securely on your active <strong>{channel === 'stripe' ? 'Stripe Connect' : 'M-Pesa Mobile'}</strong> destination.</p>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Withdrawal Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-base focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] outline-none" 
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Available pool: ${balance.toFixed(2)}</span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="px-6 py-2 bg-[#0077B6] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all hover:bg-[#0077B6]/90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Authorize Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Dialog / Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-up">
            <h3 className="text-xl font-bold font-headline mb-2 text-slate-800">Add Sandbox Trial Funds</h3>
            <p className="text-xs text-slate-500 mb-6">Instantly deposit mock earnings to test the balance withdrawals and ledger history features.</p>
            
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deposit Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="10"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-base focus:ring-2 focus:ring-[#0077B6] focus:border-[#0077B6] outline-none" 
                    placeholder="e.g. 500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="px-6 py-2 bg-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10 h-20 px-4 pb-safe flex justify-around items-center">
        <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
        </Link>
        <Link to="/opportunities" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">work_outline</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Gigs</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1 scale-110 duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Wallet</span>
        </Link>
        <Link to="/verification" className="flex flex-col items-center justify-center text-slate-400 hover:text-[#0077B6] transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
