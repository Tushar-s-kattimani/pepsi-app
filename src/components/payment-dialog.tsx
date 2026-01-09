'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPayment: (method: 'Cash on Delivery' | 'Online') => void;
}

export function PaymentDialog({ isOpen, onOpenChange, onSelectPayment }: PaymentDialogProps) {
  const { toast } = useToast();

  const handleOnlinePayment = () => {
    toast({
      title: 'Coming Soon!',
      description: 'Online payment functionality is not yet available.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Payment Method</DialogTitle>
          <DialogDescription>
            How would you like to pay for your order?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            size="lg"
            className="h-16 text-lg"
            onClick={() => onSelectPayment('Cash on Delivery')}
          >
            <Wallet className="mr-3 h-6 w-6" />
            Cash on Delivery
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="h-16 text-lg"
            onClick={handleOnlinePayment}
          >
            <CreditCard className="mr-3 h-6 w-6" />
            Pay Online
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
