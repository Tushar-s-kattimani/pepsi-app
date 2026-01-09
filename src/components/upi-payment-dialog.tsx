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
import { IndianRupee, Loader2, Copy, ScanLine } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Label } from '@/components/ui/label';
import QRCode from 'qrcode';


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
    const qrCodeRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const fetchAdminUpiIdAndGenerateQr = async () => {
            if (isOpen) {
                setIsLoadingUpi(true);
                let upiId = '';
                try {
                    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const adminDoc = querySnapshot.docs[0];
                        const fetchedUpiId = adminDoc.data().upiId || '';
                        setAdminUpiId(fetchedUpiId);
                        upiId = fetchedUpiId;
                    }
                } catch (error) {
                    console.error("Error fetching admin UPI ID: ", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch admin UPI ID.' });
                } finally {
                    setIsLoadingUpi(false);
                }

                if (upiId && qrCodeRef.current) {
                    // upi://pay?pa=UPI_ID&pn=Payee_Name&am=Amount&cu=Currency_Code
                    const upiString = `upi://pay?pa=${upiId}&pn=Admin&am=${totalAmount}&cu=INR`;
                    QRCode.toCanvas(qrCodeRef.current, upiString, { width: 220 }, (error) => {
                        if (error) console.error('Error generating QR code:', error);
                    });
                }
            }
        };

        fetchAdminUpiIdAndGenerateQr();
    }, [isOpen, totalAmount, toast]);

    const handleCopyUpi = () => {
        if(!adminUpiId) return;
        navigator.clipboard.writeText(adminUpiId);
        toast({ title: 'UPI ID Copied!', description: 'You can now paste it in your payment app.' });
    };

    const handlePaymentConfirmation = () => {
        setIsProcessing(true);
        // This is where a real payment verification would happen.
        // For this simulation, we trust the user has paid and proceed.
        onConfirmPayment();
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
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : adminUpiId ? (
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <canvas ref={qrCodeRef} className="rounded-lg shadow-md bg-white"></canvas>
                    </div>
                    <p className='text-sm text-muted-foreground'>Scan the QR code with any UPI app.</p>
                    <div className="flex items-center gap-2">
                        <p id="upiId" className="text-sm font-mono p-2 border rounded-md bg-gray-100 w-full text-center">{adminUpiId}</p>
                        <Button type="button" variant="outline" size="icon" onClick={handleCopyUpi}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy UPI ID</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="h-48 flex flex-col justify-center items-center text-center">
                    <p className="text-red-500 font-medium">Admin UPI ID is not configured.</p>
                    <p className="text-sm text-muted-foreground mt-2">Please contact support to enable online payments.</p>
                </div>
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
                        <><ScanLine className="mr-2 h-5 w-5" /> I have paid. Confirm Order.</>
                    )}
                </Button>
            </div>
        </div>

         <DialogFooter className="text-xs text-muted-foreground justify-center text-center">
          This is a simulated payment flow. After paying in your UPI app, click the button above to confirm and place your order.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
