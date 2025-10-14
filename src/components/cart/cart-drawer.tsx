
'use client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { useFirestore, useUser, errorEmitter } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function CartDrawer() {
  const { cart, itemCount, total, updateQuantity, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to place an order.',
        });
        return;
    }
    if (cart.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Empty Cart',
            description: 'Please add items to your cart before checking out.',
        });
        return;
    }

    const ordersCollection = collection(firestore, 'orders');
    const newOrder = {
        shopId: user.uid,
        shopName: user.displayName || 'Unknown Shop',
        orderDate: Timestamp.now(),
        status: 'Pending' as const,
        totalAmount: total,
        itemCount: itemCount,
        items: cart.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
        })),
    };

    try {
        await addDoc(ordersCollection, newOrder);
        toast({
            title: 'Order Placed!',
            description: 'Your order has been successfully submitted.',
        });
        clearCart();
        setIsCartOpen(false);
    } catch (err) {
        console.error("Error placing order: ", err);
        const contextualError = new FirestorePermissionError({
            path: ordersCollection.path,
            operation: 'create',
            requestResourceData: newOrder,
        });
        errorEmitter.emit('permission-error', contextualError);
        toast({
            variant: 'destructive',
            title: 'Checkout Failed',
            description: 'Could not place your order. Please try again.',
        });
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0"
            >
              {itemCount}
            </Badge>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="my-4 space-y-4 px-6">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="aspect-square rounded-md object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                        <p className="font-medium">{item.name}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.id)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="h-7 w-12 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="font-medium text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">Your cart is empty</h3>
                <p className="mt-1 text-muted-foreground">Add some products to get started.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        {cart.length > 0 && (
          <SheetFooter className="bg-background border-t p-6 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className='flex gap-2'>
                <Button variant="outline" className="w-full" onClick={() => clearCart()}>
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                </Button>
                <Button className="w-full" onClick={handleCheckout}>Checkout</Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
