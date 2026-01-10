'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface UpiPaymentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    upiId: string;
    amount: number;
    onPaymentConfirm: () => void;
}

export function UpiPaymentDialog({ isOpen, setIsOpen, upiId, amount, onPaymentConfirm }: UpiPaymentDialogProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && upiId && amount > 0) {
            setIsLoading(true);
            setError('');
            const upiLink = `upi://pay?pa=${upiId}&am=${amount.toFixed(2)}&cu=INR&tn=OrderPayment`;

            QRCode.toDataURL(upiLink)
                .then(url => {
                    setQrCodeUrl(url);
                })
                .catch(err => {
                    console.error('QR Code Generation Error:', err);
                    setError('Could not generate QR code. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, upiId, amount]);

    const handleConfirm = () => {
        onPaymentConfirm();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Scan to Pay</DialogTitle>
                    <DialogDescription className="text-center">
                        Use any UPI app to scan the QR code and complete your payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-6 flex flex-col items-center justify-center space-y-4">
                    {isLoading ? (
                        <div className="h-64 w-64 flex items-center justify-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                         <div className="h-64 w-64 flex flex-col items-center justify-center text-center text-red-600 bg-red-50 rounded-lg p-4">
                            <AlertTriangle className="h-12 w-12 mb-4" />
                            <p className="font-semibold">{error}</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-white border-4 border-primary rounded-lg shadow-lg">
                             <Image src={qrCodeUrl} alt="UPI QR Code" width={256} height={256} />
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-lg font-medium text-muted-foreground">Amount to Pay:</p>
                        <p className="text-4xl font-bold tracking-tight">{amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
                
                <DialogFooter>
                    <div className="w-full space-y-2">
                        <Button
                            type="button"
                            className="w-full h-12 text-lg"
                            onClick={handleConfirm}
                            disabled={isLoading || !!error}
                        >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            I Have Paid
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => setIsOpen(false)}>
                           Cancel
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
