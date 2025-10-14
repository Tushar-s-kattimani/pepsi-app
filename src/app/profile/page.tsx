
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Building, MapPin, Phone } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

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
      </div>
    );
  }
  
  const getInitials = (name: string) => {
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
                 <Button className="w-full">Edit Profile</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
