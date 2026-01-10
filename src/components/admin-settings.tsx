'use client';

import { useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

// A simple regex to validate common UPI ID formats.
const upiIdRegex = new RegExp(/^[\w.-]+@[\w.-]+$/);

const settingsSchema = z.object({
  upiId: z.string().refine(val => val === '' || upiIdRegex.test(val), {
    message: 'Please enter a valid UPI ID (e.g., your-name@oksbi) or leave it blank.',
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function AdminSettings() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      upiId: '',
    }
  });

  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        setLoading(true);
        const settingsDocRef = doc(db, 'settings', 'admin');
        try {
            const settingsDoc = await getDoc(settingsDocRef);
            if (settingsDoc.exists()) {
              const data = settingsDoc.data();
              reset({
                upiId: data.upiId || '',
              });
            }
        } catch (error) {
            console.error("Error fetching admin settings:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load settings. Please check console for details.' });
        } finally {
            setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [user, reset, toast]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const settingsDocRef = doc(db, 'settings', 'admin');
      // Use setDoc with merge:true to create or update the document
      await setDoc(settingsDocRef, { upiId: data.upiId || '' }, { merge: true });
      toast({ title: 'Success', description: 'Settings updated successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update settings: ${error.message}` });
      console.error("Error updating settings:", error);
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
        <CardTitle>Admin Payment Settings</CardTitle>
        <CardDescription>Set your UPI ID here to accept online payments from shops. Leave it blank to disable online payments.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input id="upiId" {...register('upiId')} placeholder="your-name@oksbi" />
            {errors.upiId && <p className="text-sm text-red-500 mt-1">{errors.upiId.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
