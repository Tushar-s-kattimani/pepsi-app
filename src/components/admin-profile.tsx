'use client';

import { useUser } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { uploadFile } from '@/firebase/storage';
import Image from 'next/image';

const profileSchema = z.object({
  upiId: z.string().min(1, 'UPI ID is required').regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Invalid UPI ID format'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function AdminProfile() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


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
          setQrCodeImageUrl(data.qrCodeImageUrl || null);
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [user, reset]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
        return;
      }
      setIsSubmitting(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { qrCodeImageUrl: null });
        setQrCodeImageUrl(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast({ title: 'Success', description: 'QR Code image removed.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not remove image.' });
      } finally {
        setIsSubmitting(false);
      }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData: { upiId: string; qrCodeImageUrl?: string | null } = {
        upiId: data.upiId,
      };
      
      let newImageUrl = qrCodeImageUrl;
      if (selectedFile) {
          const filePath = `qrcodes/${user.uid}/${selectedFile.name}`;
          newImageUrl = await uploadFile(selectedFile, filePath);
          updateData.qrCodeImageUrl = newImageUrl;
      }

      await updateDoc(userDocRef, updateData);

      if (newImageUrl) {
        setQrCodeImageUrl(newImageUrl);
      }

      setSelectedFile(null);
      setPreviewUrl(null);
       if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

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

  const currentImage = previewUrl || qrCodeImageUrl;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Admin Payment Profile</CardTitle>
        <CardDescription>
          To enable online payments for shops, you must enter your UPI ID and upload a corresponding QR code image. This QR code will be shown to users during checkout.
          <br /><br />
          This app does not connect to your bank account; it only uses the details you provide. Please ensure your UPI ID and QR code are already linked to your bank account through an app like Google Pay, PhonePe, etc.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input id="upiId" {...register('upiId')} placeholder="yourname@bank" />
            {errors.upiId && <p className="text-sm text-red-500 mt-1">{errors.upiId.message}</p>}
            <p className="text-xs text-muted-foreground mt-2">Shops will use this to verify payments.</p>
          </div>

           <div className="space-y-2">
            <Label htmlFor="qrCode">Your UPI QR Code Image</Label>
            <div className="flex items-center gap-4">
                {currentImage && (
                    <div className="relative w-32 h-32 border p-1 rounded-md bg-white">
                        <Image src={currentImage} alt="QR Code Preview" layout="fill" objectFit="contain" />
                    </div>
                )}
                <div className="flex-1 space-y-2">
                    <Input id="qrCode" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    <p className="text-xs text-muted-foreground mt-2">Upload a static QR code image from your payment app.</p>
                </div>
                 {currentImage && (
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage} disabled={isSubmitting}>
                        <Trash2 className="w-5 h-5 text-red-500"/>
                        <span className="sr-only">Remove QR Code image</span>
                    </Button>
                )}
            </div>
          </div>
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
