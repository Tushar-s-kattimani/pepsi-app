'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2, Box } from 'lucide-react';
import { collection, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useUser } from '@/firebase';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function NewOrder({ products = [], loading }: { products: any[], loading: boolean }) {
  const { cart, addToCart, updateQuantity, clearCart, subtotal, total, tax } = useCart();
  const { toast } = useToast();
  const { user } = useUser();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantities(prev => ({ ...prev, [productId]: value }));
  };
  
  const handleAddToCart = (product: any) => {
    const quantityToAdd = parseInt(quantities[product.id] || '1', 10);
     if (isNaN(quantityToAdd) || quantityToAdd < 1) {
        toast({ variant: 'destructive', title: 'Invalid Quantity', description: 'Please enter a valid quantity.' });
        return;
    }
    addToCart(product, quantityToAdd);
    // Reset quantity to 1 after adding
    handleQuantityChange(product.id, '1');
  };
  
  const handleAddBox = (product: any) => {
    if (product.boxQuantity > 0) {
      addToCart(product, product.boxQuantity);
    } else {
      toast({
        variant: 'destructive',
        title: 'No Box Quantity Set',
        description: `A standard box quantity hasn't been set for ${product.name}.`,
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to place an order.' });
      return;
    }
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Empty Cart', description: 'Please add items to your cart before placing an order.' });
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
    try {
        await runTransaction(db, async (transaction) => {
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
            
            // Create the order
            const newOrderRef = doc(collection(db, 'orders'));
            transaction.set(newOrderRef, {
                shopId: user.uid,
                shopEmail: user.email,
                items: cart,
                totalAmount: total,
                status: 'Pending',
                createdAt: serverTimestamp(),
            });

            // Update product stock
            for (const item of cart) {
                const productRef = productRefs.get(item.id);
                const productSnap = productSnapshots.get(item.id);
                const newStock = productSnap.data().stock - item.quantity;
                transaction.update(productRef, { stock: newStock });
            }
        });

        toast({ title: 'Success', description: 'Order placed successfully!' });
        clearCart();

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: error.message || 'Could not place order due to an unexpected error.',
            duration: 5000,
        });
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
                    <TableHead>Box Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>{product.boxQuantity || 'N/A'}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        {product.stock > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={quantities[product.id] || '1'}
                              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                              className="w-20 h-9"
                            />
                            <Button size="sm" onClick={() => handleAddToCart(product)} className="h-9">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                             {product.boxQuantity > 0 && (
                                <Button size="sm" variant="outline" onClick={() => handleAddBox(product)} className="h-9">
                                  <Box className="mr-2 h-4 w-4" /> Add Box
                                </Button>
                             )}
                          </div>
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
