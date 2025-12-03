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
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [shopEmail, setShopEmail] = useState('');
  const [shopPassword, setShopPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('tushar@admin.com');
  const [adminPassword, setAdminPassword] = useState('tus@12');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any | null>(null);

  const { signIn, user, loading: authLoading, signUp, sendVerificationEmail } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

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
    setUnverifiedUser(null);
    setShowVerificationMessage(false);
    try {
      const userCredential = await signIn(shopEmail, shopPassword);
      if (userCredential.user && !userCredential.user.emailVerified) {
        setError('Please verify your email address to log in.');
        setUnverifiedUser(userCredential.user); // Store the unverified user object
        await auth.signOut();
      }
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

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setLoading(true);
    try {
        await sendVerificationEmail(unverifiedUser);
        toast({
            title: 'Verification Email Sent',
            description: `A new verification link has been sent to ${unverifiedUser.email}.`,
        });
        setError('');
        setUnverifiedUser(null);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to send verification email: ${error.message}`,
        });
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
    } catch (e: any) => {
      if (e.code === 'auth/user-not-found') {
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
            Select your role to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 px-8">
          <Tabs defaultValue="shop" className="w-full" onValueChange={() => {setError(''); setUnverifiedUser(null); setShowVerificationMessage(false);}}>
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
                    placeholder="Password"
                    value={shopPassword}
                    onChange={(e) => setShopPassword(e.target.value)}
                    disabled={loading}
                    className="py-6 text-base"
                    />
                </div>
                {error && <p className="text-sm text-center font-medium text-red-500">{error}</p>}
                
                <div className="space-y-3 pt-2">
                    <Button
                    onClick={handleShopSignIn}
                    disabled={loading}
                    className="w-full py-6 text-lg"
                    >
                    {loading && !unverifiedUser ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In'}
                    </Button>
                     {unverifiedUser && (
                        <Button
                            variant="secondary"
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="w-full py-6"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailWarning className="mr-2 h-4 w-4" />}
                            Resend Verification Email
                        </Button>
                     )}
                     <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="font-semibold text-primary hover:underline">
                            Create one
                        </Link>
                    </p>
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
