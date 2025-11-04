'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, Search } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

export function Header() {
  const { user, signOut, role } = useUser();
  const { cart, updateQuantity, clearCart, subtotal, total } = useCart();

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b bg-white px-6 md:px-10">
      <div className="flex items-center gap-4">
         <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-800">
                {role === 'admin' ? 'Admin Console' : 'Shop Order Portal'}
            </h1>
            <p className="text-sm text-gray-500">
                Welcome, <span className="font-semibold">{user?.email}</span>
            </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {role === 'shop' && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">Your Cart</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto pr-4">
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <div>
                          <p className="font-semibold">{item.name} ({item.size})</p>
                          <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                          <span>{item.quantity}</span>
                          <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-8 text-center text-gray-500">Your cart is empty.</p>
                )}
              </div>
              {cart.length > 0 && (
                <SheetFooter className="mt-auto border-t pt-4">
                  <div className="w-full space-y-3">
                    <div className="flex justify-between font-medium">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between font-medium text-gray-500">
                      <span>Tax (5%)</span>
                      <span>₹{(total - subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full" size="lg" disabled>Checkout (WIP)</Button>
                    <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
                  </div>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        )}
        <Button onClick={signOut} variant="outline" className="h-10 w-10 p-0">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
