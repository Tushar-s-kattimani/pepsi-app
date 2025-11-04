'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export function ShopRevenue({ orders = [], users = [], loading }: { orders: any[], users: any[], loading: boolean }) {
  
  const shopRevenueData = useMemo(() => {
    if (loading) return [];
    
    const usersMap = new Map();
    users.forEach(user => map.set(user.id, user));

    const revenueByShop: { [key: string]: { shopInfo: any, totalAmount: number } } = {};

    orders.forEach(order => {
      if (order.status === 'Delivered') {
        if (!revenueByShop[order.shopId]) {
          const shopInfo = users.find(u => u.id === order.shopId);
          if (shopInfo) {
            revenueByShop[order.shopId] = {
              shopInfo: shopInfo,
              totalAmount: 0,
            };
          }
        }
        if (revenueByShop[order.shopId]) {
          revenueByShop[order.shopId].totalAmount += order.totalAmount;
        }
      }
    });

    return Object.values(revenueByShop).sort((a, b) => b.totalAmount - a.totalAmount);
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
                <TableHead>Shop Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shopRevenueData.map(({ shopInfo, totalAmount }) => (
                <TableRow key={shopInfo.id}>
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
