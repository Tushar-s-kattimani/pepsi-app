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
import { IndianRupee, Loader2, Copy, ScanLine, AlertCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Image from 'next/image';

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
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoadingUpi, setIsLoadingUpi] = useState(true);

    useEffect(() => {
        if (!isOpen) return;

        const fetchAdminUpiData = async () => {
            setIsLoadingUpi(true);
            setAdminUpiId('');
            setQrCodeUrl('');
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'admin'));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const adminDoc = querySnapshot.docs[0];
                    const adminData = adminDoc.data();
                    if (adminData.upiId) setAdminUpiId(adminData.upiId);
                    if (adminData.qrCodeImageUrl) setQrCodeUrl(adminData.qrCodeImageUrl);
                }
            } catch (error) {
                console.error("Error fetching admin UPI data: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch admin payment details.' });
            } finally {
                setIsLoadingUpi(false);
            }
        };

        fetchAdminUpiData();
    }, [isOpen, toast]);
    
    const handleCopyUpi = () => {
        if(!adminUpiId) return;
        navigator.clipboard.writeText(adminUpiId);
        toast({ title: 'UPI ID Copied!', description: 'You can now paste it in your payment app.' });
    };

    const handlePaymentConfirmation = () => {
        setIsProcessing(true);
        onConfirmPayment();
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Complete Your Payment</DialogTitle>
           <DialogDescription className="text-center">
            Scan the QR code to pay the total amount of:
          </DialogDescription>
          <div className="flex items-center justify-center text-4xl font-bold py-2">
              <IndianRupee className="h-8 w-8" />
              {totalAmount.toLocaleString('en-IN')}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
             {isLoadingUpi ? (
                <div className="flex justify-center items-center h-[288px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : qrCodeUrl ? (
                <div className="space-y-4 text-center">
                    <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
                        <Image src={qrCodeUrl} alt="Admin UPI QR Code" width={220} height={220} />
                    </div>
                    <p className='text-sm text-muted-foreground'>Scan the QR code with any UPI app.</p>
                      {adminUpiId && (
                        <div className="flex items-center gap-2">
                            <p id="upiId" className="text-sm font-mono p-2 border rounded-md bg-gray-100 w-full text-center">{adminUpiId}</p>
                            <Button type="button" variant="outline" size="icon" onClick={handleCopyUpi}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy UPI ID</span>
                            </Button>
                        </div>
                      )}
                </div>
            ) : (
                <div className="h-[288px] flex flex-col justify-center items-center text-center gap-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg p-4">
                    <AlertCircle className="h-12 w-12" />
                    <p className="font-semibold">Admin QR Code is not configured.</p>
                    <p className="text-sm text-yellow-700 mt-2 px-4">The administrator needs to upload a QR code image in their profile to enable online payments.</p>
                </div>
            )}

            <div className="border-t pt-4 mt-4">
                 <Button
                    size="lg"
                    className="w-full h-14 text-lg"
                    onClick={handlePaymentConfirmation}
                    disabled={isProcessing || isLoadingUpi || !qrCodeUrl}
                >
                    {isProcessing ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                        <><ScanLine className="mr-2 h-5 w-5" /> I have paid. Confirm Order.</>
                    )}
                </Button>
            </div>
        </div>

         <DialogFooter className="text-xs text-muted-foreground justify-center text-center">
          After paying in your UPI app, click the button above to confirm and place your order.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    