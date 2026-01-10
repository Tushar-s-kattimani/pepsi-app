'use client';

import { useUser } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  upiId: z.string().min(1, 'UPI ID is required').regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AdminProfile() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      upiId: '',
    }
  });

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          reset({
            upiId: data.upiId || '',
          });
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [user, reset]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        upiId: data.upiId,
      });
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update profile: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Payment Profile</CardTitle>
        <CardDescription>
          Set your UPI ID. A QR code will be automatically generated for shops to pay you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input id="upiId" {...register('upiId')} placeholder="yourname@bank" />
            {errors.upiId && <p className="text-sm text-red-500 mt-1">{errors.upiId.message}</p>}
          </div>
           <p className="text-xs text-muted-foreground mt-2">The system will generate a QR code based on this ID for online payments.</p>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
