
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { seedDatabase } from '@/lib/seed-db';
import { useEffect } from 'react';


export function RecentOrders() {
  const firestore = useFirestore();

  useEffect(() => {
    if(firestore) {
      seedDatabase(firestore);
    }
  }, [firestore])
  
  const ordersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(5)) : null
  , [firestore]);
  
  const { data: recentOrders, isLoading } = useCollection<Order>(ordersQuery);

  const totalOrdersQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'orders') : null
  , [firestore]);
  const { data: allOrders } = useCollection<Order>(totalOrdersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Orders</CardTitle>
        <CardDescription>
          {allOrders ? `You have ${allOrders.length} orders in total.` : 'Loading...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isLoading && (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {!isLoading && recentOrders?.length === 0 && (
            <div className="text-center text-muted-foreground">
                No recent orders.
            </div>
        )}
        {recentOrders?.map((order, index) => (
          <div key={order.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage
                src={`https://i.pravatar.cc/150?u=${order.shopId}`}
                alt="Avatar"
              />
              <AvatarFallback>{(order.shopName || 'S').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">
                {order.shopName}
              </p>
              <p className="text-sm text-muted-foreground">{order.id.substring(0,7)}</p>
            </div>
            <div className="ml-auto font-medium">
              +₹{order.totalAmount.toFixed(2)}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/orders">
            View All Orders <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
