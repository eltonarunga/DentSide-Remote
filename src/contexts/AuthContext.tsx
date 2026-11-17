import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'dentist' | 'client' | 'admin';
  onboardingComplete?: boolean;
  profileCompleted?: boolean;
  availableForGigs?: boolean;
  experience?: string;
  licenses?: string[];
  availability?: string;
  interests?: string[];
  clinicName?: string;
  licenseNumber?: string;
  licenseState?: string;
  verificationSubmitted?: boolean;
  payoutChannel?: 'stripe' | 'mpesa';
  degree?: string;
  institution?: string;
  graduationYear?: string;
  specialty?: string;
  subSpecialties?: string[];
  phoneNumber?: string;
  location?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeRoleOnboarding: (role: 'dentist' | 'client') => Promise<void>;
  signInAsDemo: (role: 'dentist' | 'client') => Promise<void>;
  apiFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  updateProfile: async () => {},
  completeRoleOnboarding: async () => {},
  signInAsDemo: async () => {},
  apiFetch: (input, init) => fetch(input, init),
});

export const useAuth = () => useContext(AuthContext);

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const ALLOWED_PROFILE_KEYS: Array<keyof UserProfile> = [
  'uid',
  'email',
  'displayName',
  'photoURL',
  'role',
  'onboardingComplete',
  'profileCompleted',
  'availableForGigs',
  'experience',
  'licenses',
  'availability',
  'interests',
  'clinicName',
  'licenseNumber',
  'licenseState',
  'verificationSubmitted',
  'payoutChannel',
  'degree',
  'institution',
  'graduationYear',
  'specialty',
  'subSpecialties',
  'phoneNumber',
  'location',
  'bio',
];

function sanitizeProfileData(data: Partial<UserProfile>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_PROFILE_KEYS) {
    const val = data[key];
    if (val === undefined) continue;
    if (typeof val === 'string') {
      const maxLen =
        key === 'bio' ? 2000 : key === 'photoURL' ? 2048 : key === 'email' ? 256 : 120;
      sanitized[key] = val.slice(0, maxLen);
    } else if (Array.isArray(val)) {
      const maxItems = key === 'subSpecialties' ? 10 : 20;
      sanitized[key] = val
        .filter((item): item is string => typeof item === 'string')
        .slice(0, maxItems)
        .map((item) => item.slice(0, 120));
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

function isOfflineError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('client is offline') ||
      msg.includes('network') ||
      msg.includes('unavailable')
    );
  }
  return false;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() =>
    safeJsonParse<User>(localStorage.getItem('dentside_demo_user'))
  );
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const cachedDemo = safeJsonParse<UserProfile>(localStorage.getItem('dentside_demo_profile'));
    if (cachedDemo) return cachedDemo;
    return safeJsonParse<UserProfile>(localStorage.getItem('dentside_active_profile'));
  });
  const [loading, setLoading] = useState(true);

  const fetchDemoToken = useCallback(async (role: 'dentist' | 'client'): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('dentside_demo_token', data.token);
        return data.token as string;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const getBearerToken = useCallback(async (): Promise<string | null> => {
    if (auth?.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch {
        return null;
      }
    }
    const demoUser = safeJsonParse<User>(localStorage.getItem('dentside_demo_user'));
    if (demoUser) {
      const existingToken = localStorage.getItem('dentside_demo_token');
      if (existingToken) return existingToken;
      const demoRole = demoUser.uid === 'demo_client_123' ? 'client' : 'dentist';
      return await fetchDemoToken(demoRole);
    }
    return null;
  }, [fetchDemoToken]);

  const apiFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      const token = await getBearerToken();
      const headers = new Headers(init.headers || {});
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      let response = await fetch(input, { ...init, headers });

      // Refresh demo token once if server restarted and returned 401
      if (response.status === 401) {
        const demoUser = safeJsonParse<User>(localStorage.getItem('dentside_demo_user'));
        if (demoUser) {
          const demoRole = demoUser.uid === 'demo_client_123' ? 'client' : 'dentist';
          const freshToken = await fetchDemoToken(demoRole);
          if (freshToken) {
            headers.set('Authorization', `Bearer ${freshToken}`);
            response = await fetch(input, { ...init, headers });
          }
        }
      }

      return response;
    },
    [fetchDemoToken, getBearerToken]
  );

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.removeItem('dentside_demo_user');
        localStorage.removeItem('dentside_demo_profile');
        localStorage.removeItem('dentside_demo_token');
        setUser(firebaseUser);

        const userProfileKey = `dentside_user_profile_${firebaseUser.uid}`;
        const cachedProfile = safeJsonParse<UserProfile>(localStorage.getItem(userProfileKey));
        if (cachedProfile) {
          setProfile(cachedProfile);
          localStorage.setItem('dentside_active_profile', JSON.stringify(cachedProfile));
        }

        if (db) {
          const path = `users/${firebaseUser.uid}`;
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const remoteData = userDoc.data() as UserProfile;
              const merged = { ...(cachedProfile || {}), ...remoteData };
              setProfile(merged);
              localStorage.setItem(userProfileKey, JSON.stringify(merged));
              localStorage.setItem('dentside_active_profile', JSON.stringify(merged));

              // Sync user role with backend session
              const idToken = await firebaseUser.getIdToken();
              fetch('/api/auth/sync-role', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  role: merged.role === 'client' ? 'client' : 'dentist',
                }),
              }).catch(() => {});
            } else if (!cachedProfile) {
              // New authenticated user: leave profile null so Login prompts role selection
              setProfile(null);
            }
          } catch (err) {
            if (!isOfflineError(err)) {
              try {
                handleFirestoreError(err, OperationType.GET, path);
              } catch {
                // Keep UI responsive if Firestore read is blocked
              }
            }
          }
        } else if (!cachedProfile) {
          setProfile(null);
        }
      } else {
        const cachedDemo = localStorage.getItem('dentside_demo_user');
        if (!cachedDemo) {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('dentside_active_profile');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInAsDemo = async (role: 'dentist' | 'client') => {
    const demoUserObj = {
      uid: role === 'dentist' ? 'demo_dentist_123' : 'demo_client_123',
      email: role === 'dentist' ? 'dr.jenkins@dentside.com' : 'clinic@pacificdental.com',
      displayName: role === 'dentist' ? 'Dr. Sarah Jenkins, DDS' : 'Pacific Dental Clinic',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    } as User;

    const demoProfileObj: UserProfile = {
      uid: demoUserObj.uid,
      email: demoUserObj.email || '',
      displayName: demoUserObj.displayName || '',
      photoURL: demoUserObj.photoURL || '',
      role,
      onboardingComplete: true,
      profileCompleted: true,
      availableForGigs: true,
      degree: role === 'dentist' ? 'DDS (Doctor of Dental Surgery)' : undefined,
      institution: role === 'dentist' ? 'UCSF School of Dentistry' : undefined,
      graduationYear: '2018',
      experience: '5-8 years',
      specialty: 'General Dentistry',
      subSpecialties: ['Invisalign Certified', 'Dental AI Diagnostics'],
      availability: 'Part-Time Remote (10-20 hrs/wk)',
      licenseNumber: 'DDS-948271',
      licenseState: 'California',
      location: 'San Francisco, CA',
      phoneNumber: '+1 (555) 019-2834',
      bio: 'Experienced clinical practitioner specializing in teledentistry consultations and clear aligner treatment plans.',
    };

    localStorage.setItem('dentside_demo_user', JSON.stringify(demoUserObj));
    localStorage.setItem('dentside_demo_profile', JSON.stringify(demoProfileObj));
    localStorage.setItem('dentside_active_profile', JSON.stringify(demoProfileObj));
    await fetchDemoToken(role);
    setUser(demoUserObj);
    setProfile(demoProfileObj);
  };

  const completeRoleOnboarding = async (role: 'dentist' | 'client') => {
    if (!user) return;

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName:
        user.displayName || (user.email ? user.email.split('@')[0] : 'Dr. Dental Specialist'),
      photoURL:
        user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role,
      onboardingComplete: role === 'client',
      profileCompleted: false,
      availableForGigs: role === 'dentist',
      ...(role === 'dentist'
        ? {
            degree: 'DDS (Doctor of Dental Surgery)',
            experience: '5-8 years',
            specialty: 'General Dentistry',
            subSpecialties: ['Teledentistry & Remote Consults'],
            availability: 'Part-Time Remote (10-20 hrs/wk)',
            licenseState: 'California',
          }
        : {
            clinicName: user.displayName || 'Dental Practice',
          }),
    };

    setProfile(newProfile);
    localStorage.setItem(`dentside_user_profile_${user.uid}`, JSON.stringify(newProfile));
    localStorage.setItem('dentside_active_profile', JSON.stringify(newProfile));

    if (!user.uid.startsWith('demo_')) {
      try {
        const token = await getBearerToken();
        if (token) {
          await fetch('/api/auth/sync-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role }),
          });
        }
      } catch {
        // Non-fatal
      }

      if (db) {
        const path = `users/${user.uid}`;
        try {
          const payload = {
            ...sanitizeProfileData(newProfile),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', user.uid), payload);
        } catch (err) {
          if (!isOfflineError(err)) {
            handleFirestoreError(err, OperationType.CREATE, path);
          }
        }
      }
    }
  };

  const logout = async () => {
    localStorage.removeItem('dentside_demo_user');
    localStorage.removeItem('dentside_demo_profile');
    localStorage.removeItem('dentside_demo_token');
    localStorage.removeItem('dentside_active_profile');
    setUser(null);
    setProfile(null);
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const merged = { ...(profile || { uid: user.uid, email: user.email || '', role: 'dentist' }), ...data } as UserProfile;
    setProfile(merged);

    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('dentside_demo_profile', JSON.stringify(merged));
      localStorage.setItem('dentside_active_profile', JSON.stringify(merged));
      return;
    }

    localStorage.setItem(`dentside_user_profile_${user.uid}`, JSON.stringify(merged));
    localStorage.setItem('dentside_active_profile', JSON.stringify(merged));

    if (db && user.uid) {
      const path = `users/${user.uid}`;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const existingSnap = await getDoc(userDocRef);
        const sanitized = sanitizeProfileData(existingSnap.exists() ? data : merged);
        if (!existingSnap.exists()) {
          await setDoc(userDocRef, {
            ...sanitized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(
            userDocRef,
            {
              ...sanitized,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        if (!isOfflineError(err)) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        updateProfile,
        completeRoleOnboarding,
        signInAsDemo,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
