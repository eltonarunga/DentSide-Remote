import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Loader2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  Stethoscope,
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLogo } from '../components/BrandLogo';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'consultation_payout' | 'escrow_hold' | 'escrow_release';
  amount: number;
  date: string;
  description: string;
  status: 'Completed' | 'Pending';
  channel?: 'stripe' | 'mpesa' | 'bank_transfer';
  referenceId?: string;
}

const isCreditTransaction = (type: Transaction['type']) =>
  type === 'deposit' || type === 'consultation_payout' || type === 'escrow_release';

export default function Wallet() {
  const { user, profile, updateProfile, apiFetch } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [pending, setPending] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [addAmount, setAddAmount] = useState('');

  const [channel, setChannel] = useState<'stripe' | 'mpesa'>(profile?.payoutChannel || 'stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const userId = user?.uid || 'demo_dentist_123';

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/wallet/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(typeof data.balance === 'number' ? data.balance : 0);
        setPending(typeof data.pending === 'number' ? data.pending : 0);
        setHistory(Array.isArray(data.transactions) ? data.transactions : []);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, userId]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handlePayoutChannelSelect = async (newChannel: 'stripe' | 'mpesa') => {
    setChannel(newChannel);
    try {
      await updateProfile({ payoutChannel: newChannel });
      triggerToast(
        `Payout channel switched to ${newChannel === 'stripe' ? 'Stripe Connect' : 'M-Pesa Mobile'}!`
      );
    } catch {
      triggerToast('Failed to save payout channel selection.');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 1) {
      triggerToast('Please specify a valid withdrawal amount (min $1.00).');
      return;
    }
    if (amt > balance) {
      triggerToast('Insufficient funds on your available balance.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiFetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          channel,
          destinationAccount:
            channel === 'stripe' ? 'Stripe Connect Payout' : 'M-Pesa Mobile Payout',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to withdraw');
      }

      if (typeof data.balance === 'number') setBalance(data.balance);
      if (typeof data.pending === 'number') setPending(data.pending);
      if (Array.isArray(data.transactions)) {
        setHistory(data.transactions);
      } else {
        await fetchWalletData();
      }
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      triggerToast(
        `Successfully processed withdrawal of $${amt.toFixed(2)} via ${
          channel === 'stripe' ? 'Stripe' : 'M-Pesa'
        }!`
      );
    } catch (err: any) {
      triggerToast(err.message || 'Error processing withdrawal.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt < 10) {
      triggerToast('Minimum deposit amount is $10.00.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiFetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          description: 'Direct Practice Escrow Settlement / Clinical Credit',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deposit');
      }

      if (typeof data.balance === 'number') setBalance(data.balance);
      if (typeof data.pending === 'number') setPending(data.pending);
      if (Array.isArray(data.transactions)) {
        setHistory(data.transactions);
      } else {
        await fetchWalletData();
      }
      setShowAddModal(false);
      setAddAmount('');
      triggerToast(`Added $${amt.toFixed(2)} to your balance pool!`);
    } catch (err: any) {
      triggerToast(err.message || 'Error processing deposit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportStatement = () => {
    const headers = ['ID', 'Date', 'Type', 'Status', 'Channel', 'Amount', 'Description'];
    const rows = history.map((tx) => [
      tx.id,
      `"${tx.date}"`,
      tx.type,
      tx.status,
      tx.channel || 'stripe',
      tx.amount.toFixed(2),
      `"${tx.description.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dentside-statement-${userId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Exported ${history.length} transactions to CSV statement.`);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#111111] dark:bg-surface-container-high text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-outline-variant animate-fade-in">
          <span className="material-symbols-outlined text-[#2563EB] dark:text-blue-400">info</span>
          <p className="text-xs font-semibold tracking-tight">{toastMessage}</p>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/88 backdrop-blur-xl border-b border-outline-variant">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <BrandLogo to="/dashboard" size={30} />
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                to="/opportunities"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm whitespace-nowrap"
              >
                Gigs
              </Link>
              <Link
                to="/consultations"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" /> Teledentistry
              </Link>
              <Link to="/wallet" className="text-[#2563EB] dark:text-blue-400 font-semibold text-sm whitespace-nowrap">
                Wallet
              </Link>
              <Link
                to="/profile-builder"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm whitespace-nowrap"
              >
                Qualifications
              </Link>
              <Link
                to="/verification"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm whitespace-nowrap"
              >
                Verify License
              </Link>
            </nav>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <button
                onClick={fetchWalletData}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                title="Refresh balance"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
                <img
                  alt="User avatar"
                  src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 mb-2">
            Financial Ledger
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            Wallet & Earnings
          </h1>
          <p className="text-on-surface-variant font-body text-base md:text-lg max-w-2xl leading-relaxed">
            Process medical consultation settlements, configure payout channels, and export compliant ledger statements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Financial Balance Status */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Card */}
            <div className="md:col-span-2 bg-[#111111] dark:bg-surface-container-lowest p-8 rounded-2xl text-white relative overflow-hidden border border-[#27272A]">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
                      Available Practitioner Balance
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline tabular-nums">
                      ${balance.toFixed(2)}
                    </h2>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                    <span className="material-symbols-outlined text-2xl">
                      account_balance_wallet
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors"
                  >
                    Withdraw Now
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider transition-colors"
                  >
                    Deposit Funds
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Settlements Container */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-full min-h-[152px] border border-outline-variant">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#2563EB] dark:text-blue-400 text-xl">schedule</span>
                  <span className="text-on-surface-variant font-semibold text-sm">Pending Settlements</span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-headline tabular-nums">
                  ${pending.toFixed(2)}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Incoming escrow funds awaiting case completion or clearinghouse release.
              </p>
            </div>

            {/* Next Payout Container */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl flex flex-col justify-between h-full min-h-[152px] border border-outline-variant">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#2563EB] dark:text-blue-400 text-xl">event_repeat</span>
                  <span className="text-on-surface-variant font-semibold text-sm">
                    Settlement Route
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-on-surface font-headline">
                  {channel === 'stripe' ? 'Stripe Direct' : 'M-Pesa Mobile'}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Active disbursement rail bound to your practitioner account.
              </p>
            </div>

            {/* Transaction Ledger */}
            <div className="md:col-span-2 mt-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold font-headline text-on-surface">Ledger Activity</h3>
                <button
                  onClick={handleExportStatement}
                  disabled={history.length === 0}
                  className="text-[#2563EB] dark:text-blue-400 disabled:opacity-40 font-semibold text-xs uppercase tracking-wider hover:underline"
                >
                  Export Statement
                </button>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <div className="bg-surface-container-low p-8 text-center rounded-2xl border border-outline-variant">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mx-auto" />
                  </div>
                ) : history.length > 0 ? (
                  history.map((tx) => {
                    const isCredit = isCreditTransaction(tx.type);
                    const isPendingHold = tx.type === 'escrow_hold';
                    return (
                      <div
                        key={tx.id}
                        className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              isCredit
                                ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                                : isPendingHold
                                ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400'
                                : 'bg-red-500/12 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">{tx.description}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                              {tx.date} · {tx.id.substring(0, 14)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`font-bold text-base tabular-nums ${
                              isCredit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : isPendingHold
                                ? 'text-amber-700 dark:text-amber-400'
                                : 'text-on-surface'
                            }`}
                          >
                            {isCredit ? '+' : isPendingHold ? '' : '-'}${tx.amount.toFixed(2)}
                          </p>
                          <span
                            className={`text-[11px] uppercase tracking-wider font-semibold block mt-0.5 ${
                              tx.status === 'Pending'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-[#2563EB] dark:text-blue-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-surface-container-lowest p-8 text-center rounded-2xl border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                      receipt_long
                    </span>
                    <h4 className="font-bold text-lg mb-1 font-headline text-on-surface">
                      No Transactions Yet
                    </h4>
                    <p className="text-on-surface-variant text-sm">
                      Your recent earnings and payouts will record here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Payout Methods Selection */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
              <h3 className="text-lg font-bold mb-5 font-headline text-on-surface">
                Payout Channels
              </h3>
              <div className="space-y-3">
                <div
                  onClick={() => handlePayoutChannelSelect('stripe')}
                  className={`relative cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-colors ${
                    channel === 'stripe'
                      ? 'border-[#2563EB] bg-primary-fixed'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-11 h-11 bg-[#2563EB] rounded-lg flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-on-surface">Stripe Connect</p>
                      {channel === 'stripe' && (
                        <span
                          className="material-symbols-outlined text-[#2563EB] dark:text-blue-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">Instant processing · USD/EUR</p>
                  </div>
                </div>

                <div
                  onClick={() => handlePayoutChannelSelect('mpesa')}
                  className={`relative cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-colors ${
                    channel === 'mpesa'
                      ? 'border-[#2563EB] bg-primary-fixed'
                      : 'border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">smartphone</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-on-surface">M-Pesa Mobile</p>
                      {channel === 'mpesa' && (
                        <span
                          className="material-symbols-outlined text-[#2563EB] dark:text-blue-400"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant">Mobile money · KES/TZS</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  triggerToast('Routing network parameters are active. Standard paths linked.')
                }
                className="w-full mt-5 flex items-center justify-center gap-2 border border-dashed border-outline-variant text-[#2563EB] dark:text-blue-400 p-3 rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Link Backup Account
              </button>
            </section>

            <section className="bg-[#111111] dark:bg-surface-container-lowest p-6 rounded-2xl text-white border border-[#27272A]">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2 font-headline">Ledger Protection</h3>
              <p className="text-neutral-300 text-xs leading-relaxed mb-5">
                Practitioner payouts and escrow settlements require authenticated Bearer tokens and strict account ownership validation.
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <span
                    className="material-symbols-outlined text-blue-400 text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock
                  </span>
                  Signed Token Authorization
                </li>
                <li className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                  <span
                    className="material-symbols-outlined text-blue-400 text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  Automated Escrow Release
                </li>
              </ul>
            </section>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
              <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1.5 text-sm">
                <HelpCircle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" /> Financial Assistance
              </h4>
              <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                Reconciliation specialists are available to assist with payout rail routing questions.
              </p>
              <a
                href="mailto:support@dentsideremote.com"
                className="text-[#2563EB] dark:text-blue-400 text-xs font-semibold inline-flex items-center gap-1 hover:underline"
              >
                Contact Ledger Support
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Dialog / Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-up">
            <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">
              Secure Balance Withdrawal
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Funds will settle on your active{' '}
              <strong className="text-on-surface">{channel === 'stripe' ? 'Stripe Connect' : 'M-Pesa Mobile'}</strong>{' '}
              destination.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Withdrawal Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-8 pr-4 text-base text-on-surface tabular-nums focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant block mt-1 tabular-nums">
                  Available pool: ${balance.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-up">
            <h3 className="text-xl font-bold font-headline mb-2 text-on-surface">
              Add Clinical Deposit Funds
            </h3>
            <p className="text-xs text-on-surface-variant mb-6">
              Deposit practice earnings, patient consultation payouts, or escrow into your balance.
            </p>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Deposit Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-8 pr-4 text-base text-on-surface tabular-nums focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none"
                    placeholder="e.g. 500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-surface-container text-on-surface font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-outline-variant h-16 px-4 flex justify-around items-center">
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
          <Stethoscope className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Consults</span>
        </Link>
        <Link
          to="/wallet"
          className="flex flex-col items-center justify-center text-[#2563EB] dark:text-blue-400"
        >
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
          <span className="text-[10px] font-semibold mt-0.5">Wallet</span>
        </Link>
      </nav>
    </div>
  );
}
