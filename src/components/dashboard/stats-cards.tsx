
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Users, Truck, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { useMemo } from 'react';

export function StatsCards() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'orders') : null
  , [firestore]);
  
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const stats = useMemo(() => {
    if (!orders) {
      return [
        { title: "Total Revenue", value: "₹0.00", icon: DollarSign, change: "" },
        { title: "Today's Orders", value: "0", icon: ShoppingCart, change: "" },
        { title: "New Shops", value: "4", icon: Users, change: "+2 since last week" },
        { title: "Pending Deliveries", value: "0", icon: Truck, change: "" },
      ];
    }
    
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);

    const todaysOrders = orders.filter(order => order.orderDate >= startOfTodayTimestamp).length;

    const pendingDeliveries = orders.filter(order => order.status === 'Dispatched' || order.status === 'Confirmed').length;

    return [
      {
        title: "Total Revenue",
        value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        change: `from ${orders.length} orders`
      },
      {
        title: "Today's Orders",
        value: todaysOrders.toString(),
        icon: ShoppingCart,
        change: ""
      },
      {
        title: "New Shops",
        value: "4",
        icon: Users,
        change: "+2 since last week"
      },
      {
        title: "Pending Deliveries",
        value: pendingDeliveries.toString(),
        icon: Truck,
        change: "Confirmed or Dispatched"
      },
    ];
  }, [orders]);

  if (isLoading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Loading...</div>
                        <p className="text-xs text-muted-foreground">Fetching data...</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
