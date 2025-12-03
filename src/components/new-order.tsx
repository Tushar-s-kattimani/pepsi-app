'use client';

import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2, Plus, Minus, Package } from 'lucide-react';
import { collection, serverTimestamp, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useUser } from '@/firebase';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, SecurityRuleContext } from '@/firebase/errors';


export function NewOrder({ products = [], loading }: { products: any[], loading: boolean }) {
  const { cart, addToCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useUser();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (productId: string, value: string | number) => {
    const newQuantity = Math.max(1, Number(value));
    setQuantities(prev => ({ ...prev, [productId]: newQuantity }));
  };
  
  const handleAddToCart = (product: any) => {
    const quantityToAdd = quantities[product.id] || 1;
     if (isNaN(quantityToAdd) || quantityToAdd < 1) {
        toast({ variant: 'destructive', title: 'Invalid Quantity', description: 'Please enter a valid quantity.' });
        return;
    }
    if (quantityToAdd > product.stock) {
        toast({ variant: 'destructive', title: 'Insufficient Stock', description: `Only ${product.stock} units available.` });
        return;
    }
    
    addToCart(product, quantityToAdd);
    // Reset quantity to 1 after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
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
    const newOrderRef = doc(collection(db, 'orders'));
    const orderPayload = {
        shopId: user.uid,
        shopEmail: user.email,
        items: cart.map(({ stock, ...item }: any) => item), // Remove internal fields
        status: 'Pending',
        createdAt: serverTimestamp(),
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
        // This is where permission errors from the transaction will be caught.
        const permissionError = new FirestorePermissionError({
            path: newOrderRef.path,
            operation: 'create',
            requestResourceData: orderPayload,
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);

        // Also show a generic toast to the user
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'Could not place order due to a permissions issue.',
            duration: 5000,
        });
        console.error("Transaction failed: ", error); // Log original error for good measure
    }).finally(() => {
        setIsPlacingOrder(false);
    });
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="flex flex-col">
                    <CardHeader className="flex-1">
                       <CardTitle className="text-lg flex items-center gap-3">
                          <Package className="h-6 w-6 text-muted-foreground" />
                          {product.name}
                        </CardTitle>
                    </CardHeader>
                     <CardContent className="flex-1 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Size:</span>
                            <span className="font-bold">{product.size}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-muted-foreground">Stock:</span>
                            <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>{product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch space-y-2">
                      {product.stock > 0 ? (
                          <>
                            <div className="flex w-full items-center justify-between gap-2">
                                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={quantities[product.id] || 1}
                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                className="w-16 h-9 text-center"
                              />
                               <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button size="sm" onClick={() => handleAddToCart(product)} className="w-full h-9">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add
                            </Button>
                          </>
                        ) : (
                           <Button size="sm" disabled variant="destructive" className="w-full">
                            Out of stock
                          </Button>
                        )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
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
                          {item.quantity} units
                        </p>
                      </div>
                       <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.id, 0)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
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
