import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'dentist' | 'client' | 'admin';
  onboardingComplete?: boolean;
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
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  signInAsDemo: (role: 'dentist' | 'client') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  updateProfile: async () => {},
  signInAsDemo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cachedDemo = localStorage.getItem('dentside_demo_user');
    return cachedDemo ? JSON.parse(cachedDemo) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const cachedProfile = localStorage.getItem('dentside_demo_profile');
    if (cachedProfile) {
      try {
        return JSON.parse(cachedProfile);
      } catch {
        return null;
      }
    }
    const cachedAuthProfile = localStorage.getItem('dentside_active_profile');
    if (cachedAuthProfile) {
      try {
        return JSON.parse(cachedAuthProfile);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase auth isn't configured, check for demo user and proceed
    if (!auth) {
      console.warn("Firebase Auth is not initialized. Using local offline session mode.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        localStorage.removeItem('dentside_demo_user');
        localStorage.removeItem('dentside_demo_profile');
        setUser(firebaseUser);

        // Check for locally cached profile for this specific user first to ensure instantaneous response
        const userProfileKey = `dentside_user_profile_${firebaseUser.uid}`;
        const cachedRaw = localStorage.getItem(userProfileKey);
        let existingProfile: UserProfile | null = null;
        if (cachedRaw) {
          try {
            existingProfile = JSON.parse(cachedRaw);
            setProfile(existingProfile);
            localStorage.setItem('dentside_active_profile', cachedRaw);
          } catch (e) {
            console.warn("Failed to parse cached profile", e);
          }
        }

        // Create sensible default fallback profile for the authenticated user
        const defaultProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Dr. Dental Specialist'),
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          role: existingProfile?.role || 'dentist',
          onboardingComplete: true,
          profileCompleted: true,
          degree: 'DDS (Doctor of Dental Surgery)',
          institution: 'UCSF School of Dentistry',
          graduationYear: '2019',
          experience: '5-8 years',
          specialty: 'General Dentistry',
          subSpecialties: ['Teledentistry & Remote Consults', 'Invisalign Certified'],
          availability: 'Part-Time Remote (10-20 hrs/wk)',
          licenseNumber: `DDS-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
          licenseState: 'California',
          location: 'San Francisco, CA',
          phoneNumber: '+1 (555) 234-8901',
          bio: 'Clinical dental practitioner with expertise in remote teledentistry triage, clear aligner plan evaluations, and emergency case reviews.'
        };

        if (!existingProfile) {
          setProfile(defaultProfile);
          localStorage.setItem(userProfileKey, JSON.stringify(defaultProfile));
          localStorage.setItem('dentside_active_profile', JSON.stringify(defaultProfile));
        }

        // Try syncing with Firestore if available (with offline fallback tolerance)
        if (db) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc && userDoc.exists()) {
              const remoteData = userDoc.data() as UserProfile;
              const merged = { ...defaultProfile, ...(existingProfile || {}), ...remoteData };
              setProfile(merged);
              localStorage.setItem(userProfileKey, JSON.stringify(merged));
              localStorage.setItem('dentside_active_profile', JSON.stringify(merged));
            } else {
              // Doc doesn't exist yet on remote, save default profile remotely
              try {
                await setDoc(userDocRef, existingProfile || defaultProfile, { merge: true });
              } catch (writeErr) {
                // Silently tolerate if offline
              }
            }
          } catch (fetchErr) {
            // Tolerate client offline or network errors gracefully
            console.info("Firestore sync in offline mode; using cached profile.");
          }
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

  const signInAsDemo = (role: 'dentist' | 'client') => {
    const demoUserObj = {
      uid: role === 'dentist' ? 'demo_dentist_123' : 'demo_client_123',
      email: role === 'dentist' ? 'dr.jenkins@dentside.com' : 'clinic@pacificdental.com',
      displayName: role === 'dentist' ? 'Dr. Sarah Jenkins, DDS' : 'Pacific Dental Clinic',
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    } as User;

    const demoProfileObj: UserProfile = {
      uid: demoUserObj.uid,
      email: demoUserObj.email || '',
      displayName: demoUserObj.displayName || '',
      photoURL: demoUserObj.photoURL || '',
      role: role,
      onboardingComplete: true,
      profileCompleted: true,
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
      bio: 'Experienced clinical practitioner specializing in teledentistry consultations and clear aligner treatment plans.'
    };

    localStorage.setItem('dentside_demo_user', JSON.stringify(demoUserObj));
    localStorage.setItem('dentside_demo_profile', JSON.stringify(demoProfileObj));
    localStorage.setItem('dentside_active_profile', JSON.stringify(demoProfileObj));
    setUser(demoUserObj);
    setProfile(demoProfileObj);
  };

  const logout = async () => {
    localStorage.removeItem('dentside_demo_user');
    localStorage.removeItem('dentside_demo_profile');
    localStorage.removeItem('dentside_active_profile');
    setUser(null);
    setProfile(null);
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    // Update local state and cache immediately
    const newProfile = { ...(profile || {}), ...data } as UserProfile;
    setProfile(newProfile);
    
    if (user.uid.startsWith('demo_')) {
      localStorage.setItem('dentside_demo_profile', JSON.stringify(newProfile));
      localStorage.setItem('dentside_active_profile', JSON.stringify(newProfile));
    } else {
      localStorage.setItem(`dentside_user_profile_${user.uid}`, JSON.stringify(newProfile));
      localStorage.setItem('dentside_active_profile', JSON.stringify(newProfile));
    }

    if (db && user.uid && !user.uid.startsWith('demo_')) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, data, { merge: true });
      } catch (syncErr) {
        console.info("Profile changes saved locally; Firestore sync deferred.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, updateProfile, signInAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};
