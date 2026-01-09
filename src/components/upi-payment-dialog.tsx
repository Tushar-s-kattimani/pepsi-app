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
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
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
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        const fetchAdminUpiData = async () => {
            if (!isOpen) return;

            setIsLoadingUpi(true);
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'admin'));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const adminDoc = querySnapshot.docs[0];
                    const adminData = adminDoc.data();
                    setAdminUpiId(adminData.upiId || '');
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

    useEffect(() => {
        if (isOpen && !isLoadingUpi && adminUpiId && canvasRef.current) {
            // UPI QR Code format: upi://pay?pa=<upi_id>&pn=<payee_name>&am=<amount>&cu=INR
            const upiUrl = `upi://pay?pa=${adminUpiId}&pn=Admin&am=${totalAmount}&cu=INR`;
            QRCode.toCanvas(canvasRef.current, upiUrl, { width: 220 }, (error) => {
                if (error) {
                    console.error('QR code generation failed:', error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not generate QR code.' });
                }
            });
        }
    }, [isOpen, isLoadingUpi, adminUpiId, totalAmount, toast]);

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
            ) : adminUpiId ? (
                <div className="space-y-4 text-center">
                    <div className="flex justify-center p-4 bg-white rounded-lg shadow-inner">
                        <canvas ref={canvasRef} />
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
                <div className="h-[288px] flex flex-col justify-center items-center text-center gap-4 bg-gray-50 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <p className="text-red-500 font-medium">Admin UPI ID is not configured.</p>
                    <p className="text-sm text-muted-foreground mt-2 px-4">Please contact support to enable online payments.</p>
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
          After paying in your UPI app, click the button above to confirm and place your order.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
