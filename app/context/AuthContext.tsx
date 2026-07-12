import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

interface UserProfile {
  role: 'admin' | 'mahasiswa';
  name: string;
  nim?: string;
  kelas?: string;
  prodi?: string;
  tahun?: string;
  status?: string;
  nidn?: string;      // BARU — khusus admin
  jabatan?: string;  // BARU — khusus admin
  phone?: string;    // BARU — khusus admin
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, profile: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Pantau status login/logout
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  // Begitu user diketahui, dengarkan dokumen profilnya di Firestore secara real-time
  useEffect(() => {
    if (!user) return;
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setLoading(false);
    });
    return unsubscribeProfile;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);