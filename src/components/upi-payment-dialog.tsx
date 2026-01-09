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
import { IndianRupee } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useState } from 'react';

// You would host these images in your public folder
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

    const handlePaymentSimulation = (appName: string) => {
        setIsProcessing(true);
        toast({
            title: 'Processing Payment...',
            description: `Redirecting to ${appName} to complete the payment.`,
        });

        // Simulate payment processing delay
        setTimeout(() => {
            onConfirmPayment();
            // The parent component will close the dialog upon successful order placement
            setIsProcessing(false);
             toast({
                title: 'Payment Successful!',
                description: 'Your order is being placed.',
            });
        }, 3000); // 3-second delay to simulate API calls
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Complete Your Payment</DialogTitle>
          <DialogDescription className="text-center">
            You are paying
          </DialogDescription>
          <div className="flex items-center justify-center text-4xl font-bold py-4">
              <IndianRupee className="h-8 w-8" />
              {totalAmount.toLocaleString('en-IN')}
          </div>
        </DialogHeader>
        <div className="space-y-3 py-4">
            <h3 className="text-sm font-medium text-center text-muted-foreground">
                CHOOSE A PAYMENT OPTION
            </h3>
            <Button
                size="lg"
                variant="outline"
                className="w-full h-16 text-lg justify-start gap-4"
                onClick={() => handlePaymentSimulation('Google Pay')}
                disabled={isProcessing}
            >
                <Image src={GPayLogo} alt="Google Pay" width={40} height={40} className="h-8 w-auto"/>
                Google Pay
            </Button>
             <Button
                size="lg"
                variant="outline"
                className="w-full h-16 text-lg justify-start gap-4"
                onClick={() => handlePaymentSimulation('PhonePe')}
                disabled={isProcessing}
            >
                <Image src={PhonePeLogo} alt="PhonePe" width={40} height={40} className="h-8 w-auto"/>
                PhonePe
            </Button>
             <Button
                size="lg"
                variant="outline"
                className="w-full h-16 text-lg justify-start gap-4"
                onClick={() => handlePaymentSimulation('Paytm')}
                disabled={isProcessing}
            >
                <Image src={PaytmLogo} alt="Paytm" width={40} height={40} className="h-8 w-auto"/>
                Paytm
            </Button>
        </div>
         <DialogFooter className="text-xs text-muted-foreground justify-center">
          This is a simulated payment flow. No real money will be charged.
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
