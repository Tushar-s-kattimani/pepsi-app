'use client';

import { createContext, useContext } from 'react';
import { type User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider');
  }
  return context;
};
