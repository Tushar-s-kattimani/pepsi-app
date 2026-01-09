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
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';
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
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);
  const [existingQrCodeUrl, setExistingQrCodeUrl] = useState<string | null>(null);
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
          if (data.qrCodeImageUrl) {
            setExistingQrCodeUrl(data.qrCodeImageUrl);
            setQrCodePreview(data.qrCodeImageUrl);
          }
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [user, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setQrCodeFile(null);
    setQrCodePreview(existingQrCodeUrl); // Revert to existing or null
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSubmitting(true);
    try {
      let newQrCodeUrl = existingQrCodeUrl;

      // If a new file is selected, upload it
      if (qrCodeFile) {
        newQrCodeUrl = await uploadFile(qrCodeFile, `qrcodes/${user.uid}`);
        setExistingQrCodeUrl(newQrCodeUrl); // Update the state with the new URL
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        upiId: data.upiId,
        qrCodeImageUrl: newQrCodeUrl,
      });

      setQrCodeFile(null); // Clear the file input after successful upload
      if(fileInputRef.current) fileInputRef.current.value = '';
      
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
          Set your UPI ID and upload a corresponding QR code image. This QR code will be shown to shops for online payments.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input id="upiId" {...register('upiId')} placeholder="yourname@bank" />
            {errors.upiId && <p className="text-sm text-red-500 mt-1">{errors.upiId.message}</p>}
          </div>
           <div className="space-y-2">
              <Label htmlFor="qrCode">UPI QR Code Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                    {qrCodePreview ? (
                       <Image src={qrCodePreview} alt="QR Code Preview" width={128} height={128} className="object-contain" />
                    ) : (
                       <UploadCloud className="h-10 w-10 text-gray-400" />
                    )}
                </div>
                <div className="space-y-2">
                    <Input id="qrCode" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                     {qrCodeFile && (
                        <Button type="button" variant="ghost" size="sm" onClick={removeImage}>
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Remove Image
                        </Button>
                     )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Upload a QR code from your payment app (e.g., PhonePe, Google Pay).</p>
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

    