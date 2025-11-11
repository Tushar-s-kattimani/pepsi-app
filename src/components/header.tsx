'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogOut, Menu } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut, role } = useUser();
  const { cart, updateQuantity, clearCart } = useCart();

  return (
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
              {cart.length > 0 && (
                <SheetFooter className="mt-auto border-t pt-4">
                  <div className="w-full space-y-3">
                     <div className="flex justify-between text-xl font-bold">
                      <span>Total Items</span>
                      <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
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
  );
}
