'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleAuthAction = async (action: (email: string, pass: string) => Promise<any>) => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await action(email, password);
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-700">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Distribution Management System</CardTitle>
          <CardDescription>
            Use an email with <span className="font-bold text-blue-600">@admin.com</span> for Admin access.
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
              className="py-6"
            />
            <Input
              id="password"
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="py-6"
            />
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
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
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign Up'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
