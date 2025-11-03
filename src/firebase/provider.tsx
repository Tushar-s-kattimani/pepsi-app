'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './';
import { assignUserRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const tokenResult = await user.getIdTokenResult();
        const userRole = tokenResult.claims.role || null;
        setRole(userRole);
        
        // If role is not on the token (first-time sign-up), we need to set it
        // and create the user document. The role will be available on next sign-in.
        if (!userRole) {
            const newRole = assignUserRole(user.email || '');
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { 
                uid: user.uid, 
                email: user.email, 
                role: newRole, 
                createdAt: serverTimestamp() 
            }, { merge: true });
            setRole(newRole); // Set role immediately for the current session
            await user.getIdToken(true); // Force refresh token to get new claims
        }

      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    // User doc and role are now handled by onAuthStateChanged listener to centralize logic
    return userCredential;
  };
  
  const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  const signOut = () => firebaseSignOut(auth);

  const value = { user, loading, role, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider');
  }
  return context;
};
