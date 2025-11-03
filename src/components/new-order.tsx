'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useUser } from '@/firebase';
import { useState } from 'react';

export function NewOrder({ products = [], loading }: { products: any[], loading: boolean }) {
  const { cart, addToCart, updateQuantity, clearCart, subtotal, total, tax } = useCart();
  const { toast } = useToast();
  const { user } = useUser();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to place an order.' });
      return;
    }
    setIsPlacingOrder(true);
    try {
      await addDoc(collection(db, 'orders'), {
        shopId: user.uid,
        shopEmail: user.email,
        items: cart,
        totalAmount: total,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Success', description: 'Order placed successfully!' });
      clearCart();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to place order: ${error.message}` });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        {product.stock > 0 ? (
                          <Button size="sm" onClick={() => addToCart(product)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add
                          </Button>
                        ) : (
                          <Button size="sm" disabled variant="outline">
                            Out of stock
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-10">
          <CardHeader>
            <CardTitle>Your Order</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name} ({item.size})</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} x ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                       <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, 0)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                </div>
                <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                   {isPlacingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Place Order
                </Button>
                 <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
              </div>
            ) : (
              <p className="text-center text-gray-500">Add products to start an order.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
