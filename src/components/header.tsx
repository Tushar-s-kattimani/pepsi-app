'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, Menu, Loader2, ShoppingBasket } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { collection, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, SecurityRuleContext } from '@/firebase/errors';
import { PaymentDialog } from './payment-dialog';
import { UpiPaymentDialog } from './upi-payment-dialog';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut, role } = useUser();
  const { cart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isUpiDialogOpen, setIsUpiDialogOpen] = useState(false);

  const cartItems = cart;
  const totalAmount = cart.reduce((sum, item) => sum + item.rate * item.quantity, 0);


  const handlePlaceOrderClick = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to place an order.' });
      return;
    }
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to your cart.' });
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  const handleSelectPaymentMethod = (method: 'Cash on Delivery' | 'Online') => {
    setIsPaymentDialogOpen(false);
    if (method === 'Online') {
      setIsUpiDialogOpen(true);
    } else {
      handlePlaceOrder(method);
    }
  };


  const handlePlaceOrder = async (paymentMethod: 'Cash on Delivery' | 'Online') => {
    setIsUpiDialogOpen(false); // Close UPI dialog if it was open
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to place an order.' });
      return;
    }
    
    setIsPlacingOrder(true);
    
    // 1. Check for complete profile before starting the transaction
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.profileName || !userData.phoneNumber || !userData.shopName || !userData.location) {
          toast({
            variant: 'destructive',
            title: 'Incomplete Profile',
            description: 'Please complete your profile information in the Profile section before placing an order.',
            duration: 5000,
          });
          setIsPlacingOrder(false);
          return;
        }
      } else {
        throw new Error('User data not found.');
      }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `Could not verify user profile: ${error.message}` });
        setIsPlacingOrder(false);
        return;
    }

    // 2. Run the transaction to place order and update stock
    const newOrderRef = doc(collection(db, 'orders'));
    const orderPayload = {
        shopId: user.uid,
        shopEmail: user.email,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          rate: item.rate,
        })),
        status: 'Pending',
        createdAt: serverTimestamp(),
        paymentMethod: paymentMethod,
        paymentStatus: 'Pending',
    };

    runTransaction(db, async (transaction) => {
      const productRefs = new Map<string, any>();
      const productSnapshots = new Map<string, any>();

      // First, read all product documents and check stock
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        productRefs.set(item.id, productRef);
        const productSnap = await transaction.get(productRef);
        if (!productSnap.exists()) {
          throw new Error(`Product "${item.name}" not found.`);
        }
        const currentStock = productSnap.data().stock;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Only ${currentStock} left.`);
        }
        productSnapshots.set(item.id, productSnap);
      }

      // If all stock checks passed, proceed to write
      transaction.set(newOrderRef, orderPayload);

      // Update product stock
      for (const item of cart) {
        const productRef = productRefs.get(item.id);
        const productSnap = productSnapshots.get(item.id);
        const newStock = productSnap.data().stock - item.quantity;
        transaction.update(productRef, { stock: newStock });
      }
    }).then(() => {
        toast({ title: 'Success', description: 'Order placed successfully!' });
        clearCart();
    }).catch((error: any) => {
        const isPermissionError = error.code === 'permission-denied';
        if(isPermissionError){
          const permissionError = new FirestorePermissionError({
              path: newOrderRef.path,
              operation: 'create',
              requestResourceData: orderPayload,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        }
        
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: isPermissionError ? 'Could not place order due to a permissions issue.' : error.message,
            duration: 5000,
        });
        console.error("Transaction failed: ", error);
    }).finally(() => {
        setIsPlacingOrder(false);
    });
  };

  return (
    <>
    <header className="flex h-20 shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6 md:px-10 no-print">
      <div className="flex items-center gap-4 overflow-hidden">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden flex-shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
         <div className="overflow-hidden">
             <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 text-shadow-md truncate">
                {role === 'admin' ? 'Admin Console' : 'Gajanan Enterprise Shop Portal'}
            </h1>
            <p className="text-sm text-gray-500 mt-1 truncate hidden sm:block">
                Welcome, <span className="font-semibold">{user?.email}</span>
            </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {role === 'shop' && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative flex-shrink-0">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Your Cart</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <div>
                          <p className="font-semibold">{item.name} ({item.size})</p>
                           <p className="text-sm text-gray-500">{item.quantity} units</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                          <span>{item.quantity}</span>
                          <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-8 text-center text-gray-500">Your cart is empty.</p>
                )}
              </div>
              {cartItems.length > 0 && (
                <SheetFooter className="mt-auto border-t pt-4">
                  <div className="w-full space-y-3">
                     <div className="flex justify-between text-xl font-bold">
                      <span>Total Items</span>
                      <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                     <Button className="w-full" onClick={handlePlaceOrderClick} disabled={isPlacingOrder}>
                       {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBasket className="mr-2 h-4 w-4" />}
                      Place Order
                    </Button>
                    <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
                  </div>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        )}
        <Button onClick={signOut} variant="outline" className="h-10 w-10 p-0 flex-shrink-0">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
    <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSelectPayment={handleSelectPaymentMethod}
      />
      <UpiPaymentDialog
        isOpen={isUpiDialogOpen}
        onOpenChange={setIsUpiDialogOpen}
        totalAmount={totalAmount}
        onConfirmPayment={() => handlePlaceOrder('Online')}
      />
    </>
  );
}
