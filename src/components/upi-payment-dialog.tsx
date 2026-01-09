'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { IndianRupee, Loader2, Copy } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Label } from '@/components/ui/label';

const GPayLogo = 'https://upload.wikimedia.org/wikipedia/commons/1/13/Google_Pay_GPay_Logo.svg';
const PhonePeLogo = 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg';
const PaytmLogo = 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Paytm_Logo.svg';

interface UpiPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onConfirmPayment: () => void;
}

export function UpiPaymentDialog({ isOpen, onOpenChange, totalAmount, onConfirmPayment }: UpiPaymentDialogProps) {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [adminUpiId, setAdminUpiId] = useState('');
    const [isLoadingUpi, setIsLoadingUpi] = useState(true);

    useEffect(() => {
        const fetchAdminUpiId = async () => {
            if (isOpen) {
                setIsLoadingUpi(true);
                try {
                    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const adminDoc = querySnapshot.docs[0];
                        setAdminUpiId(adminDoc.data().upiId || '');
                    }
                } catch (error) {
                    console.error("Error fetching admin UPI ID: ", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch admin UPI ID.' });
                } finally {
                    setIsLoadingUpi(false);
                }
            }
        };

        fetchAdminUpiId();
    }, [isOpen, toast]);

    const handleCopyUpi = () => {
        navigator.clipboard.writeText(adminUpiId);
        toast({ title: 'UPI ID Copied!', description: 'You can now paste it in your payment app.' });
    };

    const handlePaymentConfirmation = () => {
        setIsProcessing(true);
        toast({
            title: 'Confirming Payment...',
            description: 'Please wait while we confirm your payment and place the order.',
        });

        // Simulate a delay for payment processing
        setTimeout(() => {
            onConfirmPayment();
            setIsProcessing(false);
        }, 3000); 
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Complete Your Payment</DialogTitle>
           <DialogDescription className="text-center">
            You are paying
          </DialogDescription>
          <div className="flex items-center justify-center text-4xl font-bold py-2">
              <IndianRupee className="h-8 w-8" />
              {totalAmount.toLocaleString('en-IN')}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
             {isLoadingUpi ? (
                <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : adminUpiId ? (
                <div className="space-y-3 text-center">
                    <Label htmlFor="upiId" className="text-muted-foreground font-normal">Send the payment to the admin's UPI ID:</Label>
                    <div className="flex items-center gap-2">
                        <p id="upiId" className="text-lg font-mono p-2 border rounded-md bg-gray-100 w-full text-center">{adminUpiId}</p>
                        <Button type="button" variant="outline" size="icon" onClick={handleCopyUpi}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy UPI ID</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-center text-red-500 font-medium">Admin UPI ID is not configured. Please contact support.</p>
            )}

            <div className="border-t pt-4 mt-4">
                 <Button
                    size="lg"
                    className="w-full h-14 text-lg"
                    onClick={handlePaymentConfirmation}
                    disabled={isProcessing || isLoadingUpi || !adminUpiId}
                >
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                        'I have paid. Confirm Order.'
                    )}
                </Button>
            </div>
        </div>

         <DialogFooter className="text-xs text-muted-foreground justify-center">
          This is a simulated payment flow. After paying, click the button above.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
