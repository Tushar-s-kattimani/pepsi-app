'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package, User, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';


export default function LoginPage() {
  const [shopEmail, setShopEmail] = useState('');
  const [shopPassword, setShopPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleShopAuth = async (action: (email: string, pass:string) => Promise<any>) => {
    if (!shopEmail || !shopPassword) {
      setError("Email and password cannot be empty.");
      return;
    }
    if (action === signUp && shopPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (shopEmail.endsWith('@admin.com')) {
      setError("This panel is for shop accounts only. Use the Admin panel for admin login.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await action(shopEmail, shopPassword);
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

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) {
      setError("Admin email and password cannot be empty.");
      return;
    }
    if (adminEmail.toLowerCase() !== 'tushar@admin.com') {
      setError("Invalid admin email address.");
      return;
    }
    if (adminPassword !== 'tushar@123') {
        setError("Invalid admin password.");
        return;
    }

    setLoading(true);
    setError('');
    try {
      await signIn(adminEmail, adminPassword);
      // The useEffect will handle the redirect
    } catch (e: any) {
      setError('Admin sign-in failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

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
          <CardTitle className="text-3xl font-bold">Distribution Hub</CardTitle>
          <CardDescription className="text-base">
            Select your role to sign in or create an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="shop" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shop"><User className="mr-2 h-4 w-4" /> Shop</TabsTrigger>
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
                {error && <p className="text-sm text-center text-red-500 font-medium">{error}</p>}
                <div className="space-y-3">
                    <Button
                    onClick={() => handleShopAuth(signIn)}
                    disabled={loading}
                    className="w-full py-6 text-lg"
                    >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In'}
                    </Button>
                    <Button
                    onClick={() => handleShopAuth(signUp)}
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
                {error && <p className="text-sm text-center text-red-500 font-medium">{error}</p>}
                <Button
                    onClick={handleAdminLogin}
                    disabled={loading}
                    className="w-full py-6 text-lg"
                >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Sign In as Admin'}
                </Button>
                <p className="text-xs text-center text-gray-500">
                    Use the provided administrator credentials to access the admin dashboard.
                </p>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
