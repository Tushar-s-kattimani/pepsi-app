'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';

const statusColorMap: Record<Order['status'], string> = {
  Pending: 'bg-yellow-400',
  Confirmed: 'bg-blue-500',
  Dispatched: 'bg-indigo-500',
  Delivered: 'bg-green-500',
  Cancelled: 'bg-red-500',
};

export default function OrdersPage() {
  const firestore = useFirestore();
  const ordersQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null
  , [firestore]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const handleCreateOrder = async () => {
    if (!firestore) return;
    const ordersCollection = collection(firestore, 'orders');
    const newOrder = {
      shopId: 'new-shop-' + Math.random().toString(36).substring(7),
      shopName: 'New Online Store',
      orderDate: Timestamp.now(),
      status: 'Pending' as const,
      totalAmount: Math.floor(Math.random() * 200) + 50,
      itemCount: Math.floor(Math.random() * 10) + 1,
    };
    try {
        addDoc(ordersCollection, newOrder)
        .catch(err => {
            const contextualError = new FirestorePermissionError({
                path: ordersCollection.path,
                operation: 'create',
                requestResourceData: newOrder
            });
            errorEmitter.emit('permission-error', contextualError);
        });
    } catch(err) {
        console.error("Error creating order:", err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Order Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all customer orders.
          </p>
        </header>
        <Button onClick={handleCreateOrder}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A list of all recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Shop Name</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading orders...</p>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && orders?.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center">
                        <p className="text-muted-foreground">No orders found.</p>
                    </TableCell>
                 </TableRow>
              )}
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0,7)}</TableCell>
                  <TableCell>{order.shopName || order.shopId}</TableCell>
                   <TableCell>
                    {format(order.orderDate.toDate(), 'PPP')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={cn(
                        'text-white hover:text-black',
                        statusColorMap[order.status]
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell className="text-right">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
