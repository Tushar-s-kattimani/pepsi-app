'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export function ShopRevenue({ orders = [], users = [], loading }: { orders: any[], users: any[], loading: boolean }) {
  
  const shopRevenueData = useMemo(() => {
    if (loading || !orders.length || !users.length) return [];
    
    const usersMap = new Map();
    users.forEach(user => usersMap.set(user.id, user));

    const deliveredOrders = orders
      .filter(order => order.status === 'Delivered' && order.createdAt?.toDate)
      .map(order => {
        const shopInfo = usersMap.get(order.shopId);
        return {
          ...order,
          shopInfo: shopInfo || null,
        };
      })
      .filter(order => order.shopInfo !== null); // Ensure we have shop info

    // Sort by most recent first
    return deliveredOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [orders, users, loading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Revenue from Delivered Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Shop Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead className="text-right">Order Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shopRevenueData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.createdAt.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell>{order.shopInfo.shopName || 'N/A'}</TableCell>
                  <TableCell>{order.shopInfo.location || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-xs">{order.id.substring(0,8)}</TableCell>
                  <TableCell className="text-right font-medium">₹{order.totalAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
