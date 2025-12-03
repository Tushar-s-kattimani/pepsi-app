'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, MailWarning, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const { signUp } = useUser();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Email and password cannot be empty.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (email.endsWith('@admin.com')) {
      setError("To create an admin account, please contact the system administrator.");
      return;
    }
    setLoading(true);
    setError('');
    setShowVerificationMessage(false);
    try {
      await signUp(email, password);
      setShowVerificationMessage(true);
    } catch (e: any) {
      let friendlyMessage = 'An unexpected error occurred during sign up.';
      if (e.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email already exists. Please sign in instead.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <UserPlus className="h-10 w-10" />
            </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Create a Shop Account</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
           {showVerificationMessage ? (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                         <MailWarning className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Verify Your Email</h3>
                    <p className="text-muted-foreground">
                        Account created successfully! We&apos;ve sent a verification link to your email address. Please check your inbox and follow the link to activate your account before signing in.
                    </p>
                    <Button asChild className="w-full py-6 text-lg">
                        <Link href="/login">Back to Sign In</Link>
                    </Button>
                </div>
           ) : (
                <div className="space-y-6 pt-6">
                    <div className="space-y-4">
                        <Input
                        id="email"
                        type="email"
                        placeholder="Shop Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="py-6 text-base"
                        />
                        <Input
                        id="password"
                        type="password"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="py-6 text-base"
                        />
                    </div>
                    {error && <p className="text-sm text-center font-medium text-red-500">{error}</p>}
                    
                    <div className="space-y-3 pt-2">
                        <Button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="w-full py-6 text-lg"
                        >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Account'}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
