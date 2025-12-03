'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package, User as UserIcon, Shield, MailWarning } from 'lucide-react';
import { auth } from '@/firebase/config';

export default function LoginPage() {
  const [shopEmail, setShopEmail] = useState('');
  const [shopPassword, setShopPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('tushar@admin.com');
  const [adminPassword, setAdminPassword] = useState('tus@12');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const { signUp, signIn, user, loading: authLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleShopSignUp = async () => {
    if (!shopEmail || !shopPassword) {
      setError("Email and password cannot be empty.");
      return;
    }
    if (shopPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (shopEmail.endsWith('@admin.com')) {
      setError("This panel is for shop accounts only. Use the Admin panel for admin login.");
      return;
    }
    setLoading(true);
    setError('');
    setShowVerificationMessage(false);
    try {
      await signUp(shopEmail, shopPassword);
      setShowVerificationMessage(true);
    } catch (e: any) {
      let friendlyMessage = 'An unexpected error occurred during sign up.';
      if (e.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email already exists. Please sign in or verify your email.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShopSignIn = async () => {
    if (!shopEmail || !shopPassword) {
      setError("Email and password cannot be empty.");
      return;
    }
     if (shopEmail.endsWith('@admin.com')) {
      setError("This panel is for shop accounts only. Use the Admin panel for admin login.");
      return;
    }
    setLoading(true);
    setError('');
    setShowVerificationMessage(false);
    try {
      const userCredential = await signIn(shopEmail, shopPassword);
      // After successful sign-in attempt, check if email is verified
      if (userCredential.user && !userCredential.user.emailVerified) {
        // User is not an admin and email is not verified
        setError('Please verify your email address to log in. Check your inbox for a verification link.');
        await auth.signOut(); // Sign them out again
      }
      // If verified, the useEffect will redirect
    } catch (e: any) {
      let friendlyMessage = 'An unexpected error occurred.';
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password. Please try again.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleAdminSignIn = async () => {
    if (!adminEmail || !adminPassword) {
      setError("Email and password cannot be empty.");
      return;
    }
    if (!adminEmail.endsWith('@admin.com')) {
        setError("Invalid email format for an admin account.");
        return;
    }
    setLoading(true);
    setError('');
    setShowVerificationMessage(false);
    try {
      await signIn(adminEmail, adminPassword);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        // If user not found, try to sign them up as an admin
        try {
          await signUp(adminEmail, adminPassword);
        } catch (signUpError: any) {
           let friendlyMessage = 'An unexpected error occurred during sign up.';
            if (signUpError.code === 'auth/email-already-in-use') {
                friendlyMessage = 'An admin account with this email already exists. Please sign in.';
            }
            setError(friendlyMessage);
        }
      } else {
         let friendlyMessage = 'An unexpected error occurred.';
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            friendlyMessage = 'Invalid email or password. Please try again.';
        }
        setError(friendlyMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
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
        <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Package className="h-10 w-10" />
            </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Distribution Hub</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Select your role to sign in or create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <Tabs defaultValue="shop" className="w-full" onValueChange={() => {setError(''); setShowVerificationMessage(false);}}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shop"><UserIcon className="mr-2 h-4 w-4" /> Shop</TabsTrigger>
              <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" /> Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="shop" className="space-y-6 pt-6">
                <div className="space-y-4">
                    <Input
                    id="shop-email"
                    type="email"
                    placeholder="Shop Email Address"
                    value={shopEmail}
                    onChange={(e) => setShopEmail(e.target.value)}
                    disabled={loading}
                    className="py-6 text-base"
                    />
                    <Input
                    id="shop-password"
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={shopPassword}
                    onChange={(e) => setShopPassword(e.target.value)}
                    disabled={loading}
                    className="py-6 text-base"
                    />
                </div>
                {error && <p className="text-sm text-center font-medium text-red-500">{error}</p>}
                {showVerificationMessage && (
                  <div className="flex items-center gap-3 rounded-md bg-green-50 p-3 text-green-800">
                    <MailWarning className="h-6 w-6 flex-shrink-0" />
                    <p className="text-sm font-medium">Account created! Please check your email inbox to verify your account before signing in.</p>
                  </div>
                )}
                <div className="space-y-3 pt-2">
                    <Button
                    onClick={handleShopSignIn}
                    disabled={loading}
                    className="w-full py-6 text-lg"
                    >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In'}
                    </Button>
                    <Button
                    onClick={handleShopSignUp}
                    disabled={loading}
                    variant="outline"
                    className="w-full py-6 text-lg"
                    >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Create Account'}
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6 pt-6">
                 <div className="space-y-4">
                    <Input
                    id="admin-email"
                    type="email"
                    placeholder="Admin Email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={loading}
                    className="py-6 text-base"
                    />
                    <Input
                    id="admin-password"
                    type="password"
                    placeholder="Admin Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={loading}
                    className="py-6 text-base"
                    />
                </div>
                {error && <p className="text-sm text-center font-medium text-red-500">{error}</p>}
                 <div className="space-y-3 pt-2">
                    <Button
                        onClick={handleAdminSignIn}
                        disabled={loading}
                        className="w-full py-6 text-lg"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In as Admin'}
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">
                    Use an email ending in @admin.com to create or access an admin account.
                </p>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
