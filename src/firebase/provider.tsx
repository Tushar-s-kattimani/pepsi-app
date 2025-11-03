'use client';

import { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './';
import { AuthContext } from './auth/use-user';
import { assignUserRole } from '@/lib/auth';

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userRole = userDoc.data().role || 'shop';
          setRole(userRole);
        } else {
          // Document doesn't exist, so this is a new sign-up
          const newRole = assignUserRole(user.email || '');
          try {
            const userData: any = {
              uid: user.uid,
              email: user.email,
              role: newRole,
              createdAt: serverTimestamp(),
            };
            if (newRole === 'shop') {
              userData.profileName = '';
              userData.phoneNumber = '';
              userData.shopName = '';
              userData.location = '';
            }
            await setDoc(userDocRef, userData);
            setRole(newRole);
          } catch (error) {
            console.error("Error creating user document:", error);
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
  const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, role, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
