'use client';

import { ReactNode, useEffect, useState } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
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
        const userRoleGuess = assignUserRole(user.email || '');
        if (userRoleGuess === 'admin' || user.emailVerified) {
          setUser(user);
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userRole = userDoc.data().role || 'shop';
            setRole(userRole);
          } else {
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
          // This block now mainly serves to prevent login for unverified users
          // The actual user object is handled on the login page for resending verification
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
        if (assignUserRole(email) === 'shop') {
            await sendEmailVerification(userCredential.user);
            await firebaseSignOut(auth); 
        }
    }
    return userCredential;
  };

  const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
  const signOut = () => firebaseSignOut(auth);
  const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);
  const sendVerificationEmail = (user: User) => sendEmailVerification(user);


  return (
    <AuthContext.Provider value={{ user, loading, role, signUp, signIn, signOut, sendPasswordReset, sendVerificationEmail }}>
      {children}
      <FirebaseErrorListener />
    </AuthContext.Provider>
  );
}
