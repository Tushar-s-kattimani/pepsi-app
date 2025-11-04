'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export function ShopRevenue({ orders = [], users = [], loading }: { orders: any[], users: any[], loading: boolean }) {
  
  const shopRevenueData = useMemo(() => {
    if (loading) return [];
    
    const usersMap = new Map();
    users.forEach(user => usersMap.set(user.id, user));

    const revenueByShopAndDate: { [key: string]: { shopInfo: any, totalAmount: number, date: string } } = {};

    orders.forEach(order => {
      if (order.status === 'Delivered' && order.createdAt?.toDate) {
        const dateStr = order.createdAt.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const key = `${order.shopId}-${dateStr}`;

        if (!revenueByShopAndDate[key]) {
           const shopInfo = usersMap.get(order.shopId);
           if (shopInfo) {
              revenueByShopAndDate[key] = {
                shopInfo: shopInfo,
                totalAmount: 0,
                date: dateStr,
              };
           }
        }
        
        if (revenueByShopAndDate[key]) {
          revenueByShopAndDate[key].totalAmount += order.totalAmount;
        }
      }
    });

    return Object.values(revenueByShopAndDate).sort((a, b) => b.date.localeCompare(a.date));
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
                <TableHead>Date</TableHead>
                <TableHead>Shop Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shopRevenueData.map(({ shopInfo, totalAmount, date }) => (
                <TableRow key={`${shopInfo.id}-${date}`}>
                  <TableCell>{new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                  <TableCell>{shopInfo.shopName || 'N/A'}</TableCell>
                  <TableCell>{shopInfo.location || 'N/A'}</TableCell>
                  <TableCell className="text-right font-medium">₹{totalAmount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
