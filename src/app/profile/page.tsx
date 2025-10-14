
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth, errorEmitter } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Building, MapPin, Phone, Save } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FirestorePermissionError } from '@/firebase/errors';


const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  shopName: z.string().optional(),
  place: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );

  const { data: userProfile, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userProfileRef);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      shopName: '',
      place: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        displayName: userProfile.displayName,
        shopName: userProfile.shopName || '',
        place: userProfile.place || '',
        phoneNumber: userProfile.phoneNumber || '',
      });
    }
  }, [userProfile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user || !userProfileRef) return;
    setIsUpdating(true);

    try {
      // Update Firestore document
      updateDoc(userProfileRef, data)
        .catch(error => {
          const contextualError = new FirestorePermissionError({
            path: userProfileRef.path,
            operation: 'update',
            requestResourceData: data,
          });
          errorEmitter.emit('permission-error', contextualError);
          throw error; // Rethrow to be caught by the outer catch
        });

      // Update Firebase Auth profile
      if (user.displayName !== data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };


  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="text-center">
        <p>Could not load user profile.</p>
        {error && <p className="text-destructive">{error.message}</p>}
      </div>
    );
  }
  
  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }


  return (
    <div className="flex flex-col gap-8">
       <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          User Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your account details.
        </p>
      </header>

      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary">
            <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={userProfile.displayName} />
            <AvatarFallback className="text-3xl">{getInitials(userProfile.displayName)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{userProfile.displayName}</CardTitle>
          <CardDescription>{userProfile.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-4 space-y-6">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-md">
                    <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Shop Name</p>
                    <p className="font-medium">{userProfile.shopName || 'Not set'}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-md">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Place</p>
                    <p className="font-medium">{userProfile.place || 'Not set'}</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-md">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{userProfile.phoneNumber || 'Not set'}</p>
                </div>
            </div>
            <div className="pt-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">Edit Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Full Name</Label>
                                <Controller
                                    name="displayName"
                                    control={control}
                                    render={({ field }) => <Input id="displayName" {...field} />}
                                />
                                {errors.displayName && <p className="text-destructive text-sm">{errors.displayName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shopName">Shop Name</Label>
                                <Controller
                                    name="shopName"
                                    control={control}
                                    render={({ field }) => <Input id="shopName" {...field} />}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="place">Place</Label>
                                <Controller
                                    name="place"
                                    control={control}
                                    render={({ field }) => <Input id="place" {...field} />}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Controller
                                    name="phoneNumber"
                                    control={control}
                                    render={({ field }) => <Input id="phoneNumber" type="tel" {...field} />}
                                />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
