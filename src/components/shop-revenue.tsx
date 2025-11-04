'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ShopRevenue({ orders = [], users = [], loading }: { orders: any[], users: any[], loading: boolean }) {
  const [selectedDate, setSelectedDate] = useState('');

  const shopRevenueData = useMemo(() => {
    if (loading || !orders.length || !users.length) return [];
    
    const usersMap = new Map();
    users.forEach(user => usersMap.set(user.id, user));

    let deliveredOrders = orders
      .filter(order => order.status === 'Delivered' && order.createdAt?.toDate)
      .map(order => {
        const shopInfo = usersMap.get(order.shopId);
        return {
          ...order,
          shopInfo: shopInfo || null,
        };
      })
      .filter(order => order.shopInfo !== null);

    if (selectedDate) {
      deliveredOrders = deliveredOrders.filter(order => {
        const orderDate = order.createdAt.toDate().toISOString().split('T')[0]; // YYYY-MM-DD
        return orderDate === selectedDate;
      });
    }

    return deliveredOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [orders, users, loading, selectedDate]);

  const totalForDate = useMemo(() => {
    return shopRevenueData.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [shopRevenueData]);
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <Card className="printable-area">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between no-print">
        <CardTitle>Shop Revenue from Delivered Orders</CardTitle>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto"
          />
          <Button variant="outline" onClick={() => setSelectedDate('')} disabled={!selectedDate}>Clear</Button>
           <Button onClick={handlePrint} disabled={shopRevenueData.length === 0}>
            <Printer className="mr-2 h-4 w-4" />
            Print / PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <>
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
                {shopRevenueData.length > 0 ? (
                  shopRevenueData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.createdAt.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell>{order.shopInfo.shopName || 'N/A'}</TableCell>
                      <TableCell>{order.shopInfo.location || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{order.id.substring(0,8)}</TableCell>
                      <TableCell className="text-right font-medium">₹{order.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      {selectedDate ? 'No delivered orders on this date.' : 'No delivered orders yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {selectedDate && shopRevenueData.length > 0 && (
              <div className="mt-4 text-right text-lg font-bold pr-4">
                Total for {new Date(selectedDate+'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}: ₹{totalForDate.toLocaleString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
