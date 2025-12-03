'use client';

import { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './';
import { AuthContext } from './auth/use-user';
import { assignUserRole } from '@/lib/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // For admin users, bypass email verification check
        const userRoleGuess = assignUserRole(user.email || '');
        if (userRoleGuess === 'admin' || user.emailVerified) {
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
          // User is not an admin and email is not verified
          setUser(null);
          setRole(null);
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
    if (userCredential.user) {
        // Send verification email only for non-admin users
        if (assignUserRole(email) === 'shop') {
            await sendEmailVerification(userCredential.user);
            await firebaseSignOut(auth); // Sign out to force verification
        }
    }
    return userCredential;
  };

  const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, role, signUp, signIn, signOut }}>
      {children}
      <FirebaseErrorListener />
    </AuthContext.Provider>
  );
}
