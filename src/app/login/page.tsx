'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleAuthAction = async (action: (email: string, pass:string) => Promise<any>) => {
    if (!email || !password) {
      setError("Email and password cannot be empty.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await action(email, password);
      // The useEffect will handle the redirect
    } catch (e: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        friendlyMessage = 'Invalid email or password. Please try again.';
      } else if (e.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email already exists. Please sign in.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Package className="h-8 w-8" />
            </div>
          <CardTitle className="text-3xl font-bold">Distribution Management</CardTitle>
          <CardDescription className="text-base">
            Sign in or create an account to continue. Use an email with 
            <span className="font-bold text-primary"> @admin.com </span> 
            for Admin access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="py-6 text-base"
              aria-label="Email Address"
            />
            <Input
              id="password"
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="py-6 text-base"
              aria-label="Password"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500 font-medium">{error}</p>}
          <div className="space-y-3">
            <Button
              onClick={() => handleAuthAction(signIn)}
              disabled={loading}
              className="w-full py-6 text-lg"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In'}
            </Button>
            <Button
              onClick={() => handleAuthAction(signUp)}
              disabled={loading}
              variant="outline"
              className="w-full py-6 text-lg"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
