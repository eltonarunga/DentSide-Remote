import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, User as UserIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../components/ThemeToggle';
import { BrandLogo } from '../components/BrandLogo';

export default function Login() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading: authLoading,
    signInAsDemo,
    completeRoleOnboarding,
  } = useAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | 'role_selection'>('login');

  useEffect(() => {
    if (!authLoading && user && !isSigningIn) {
      if (profile) {
        navigate(profile.role === 'client' ? '/client-dashboard' : '/dashboard', {
          replace: true,
        });
      } else {
        setStep('role_selection');
      }
    }
  }, [user, profile, authLoading, isSigningIn, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');

    if (!auth || !db) {
      setError(
        'Firebase keys are not configured in this environment. Use Instant Preview Access below to test DentSide Remote.'
      );
      setIsSigningIn(false);
      return;
    }

    let signInSucceeded = false;
    try {
      await signInWithPopup(auth, googleProvider);
      signInSucceeded = true;
    } catch (err: any) {
      console.error(err);
      if (
        err.code === 'auth/unauthorized-domain' ||
        (err.message && err.message.includes('unauthorized-domain'))
      ) {
        const currentDomain = window.location.hostname;
        setError(
          `Firebase Auth domain unauthorized. Please add "${currentDomain}" to Authorized Domains in Firebase Console (Authentication > Settings > Authorized Domains), or use Demo Access below to continue.`
        );
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setIsSigningIn(false);
      if (signInSucceeded && auth.currentUser && !profile) {
        setStep('role_selection');
      }
    }
  };

  const handleDemoSignIn = async (role: 'dentist' | 'client') => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInAsDemo(role);
      navigate(role === 'dentist' ? '/dashboard' : '/client-dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in as demo user');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRoleSelection = async (role: 'dentist' | 'client') => {
    if (!user) return;
    setIsSigningIn(true);
    setError('');

    try {
      await completeRoleOnboarding(role);
      navigate(role === 'dentist' ? '/dashboard' : '/client-dashboard', { replace: true });
    } catch (err: any) {
      console.error('Role onboarding error:', err);
      setError(err.message || 'Failed to complete onboarding.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-body relative">
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-5">
          <BrandLogo to="/" size={40} textClassName="text-2xl" />
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold font-headline text-on-surface tracking-tight">
          {step === 'login' ? 'Sign in to your account' : 'Choose your account type'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-lowest py-8 px-6 sm:px-10 rounded-2xl border border-outline-variant">
          {error && (
            <div className="mb-5 bg-error-container border border-error/30 text-error px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === 'login' && (
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || authLoading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-outline-variant rounded-xl bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50 transition-colors"
              >
                {isSigningIn || authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-surface-container-lowest px-3 text-on-surface-variant font-semibold">
                    Instant Preview Access
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDemoSignIn('dentist')}
                  disabled={isSigningIn}
                  className="w-full py-2.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="w-4 h-4" /> Dentist Demo
                </button>
                <button
                  onClick={() => handleDemoSignIn('client')}
                  disabled={isSigningIn}
                  className="w-full py-2.5 px-3 bg-on-surface text-background hover:opacity-90 rounded-xl text-xs font-semibold transition-opacity flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" /> Client Demo
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-[#2563EB] dark:text-blue-400 hover:underline font-medium inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
                </button>
              </div>
            </div>
          )}

          {step === 'role_selection' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-on-surface-variant text-center mb-6">
                Welcome! Choose how you will use DentSide Remote.
              </p>

              <button
                onClick={() => handleRoleSelection('dentist')}
                disabled={isSigningIn}
                className="w-full flex items-center p-4 border border-outline-variant rounded-xl hover:border-[#2563EB] hover:bg-primary-fixed/60 transition-colors text-left group"
              >
                <div className="bg-primary-fixed p-3 rounded-xl text-[#2563EB] dark:text-blue-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-bold text-on-surface">I'm a Dentist</h3>
                  <p className="text-sm text-on-surface-variant">
                    Find remote gigs, AI scan reviews, and teledental consults.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection('client')}
                disabled={isSigningIn}
                className="w-full flex items-center p-4 border border-outline-variant rounded-xl hover:border-[#2563EB] hover:bg-primary-fixed/60 transition-colors text-left group"
              >
                <div className="bg-surface-container p-3 rounded-xl text-on-surface">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-bold text-on-surface">I'm a Client / Clinic</h3>
                  <p className="text-sm text-on-surface-variant">
                    Hire verified dentists and dispatch teledentistry cases.
                  </p>
                </div>
              </button>

              {isSigningIn && (
                <div className="flex justify-center mt-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
