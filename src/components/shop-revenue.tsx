'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    
    const title = selectedDate 
      ? `Shop Revenue for ${new Date(selectedDate+'T00:00:00').toLocaleDateString('en-GB')}`
      : 'Shop Revenue from All Delivered Orders';
      
    doc.text(title, 14, 15);

    (doc as any).autoTable({
      startY: 20,
      head: [['Date & Time', 'Shop Name', 'Location', 'Order ID', 'Amount (₹)']],
      body: shopRevenueData.map(order => [
        order.createdAt.toDate().toLocaleString('en-GB'),
        order.shopInfo.shopName || 'N/A',
        order.shopInfo.location || 'N/A',
        order.id.substring(0, 8),
        order.totalAmount.toLocaleString()
      ]),
      foot: [['', '', '', 'Total', totalForDate.toLocaleString()]],
      footStyles: { fontStyle: 'bold', fillColor: [230, 230, 230], textColor: 0 }
    });

    doc.save('shop_revenue_report.pdf');
  }

  return (
    <Card className="printable-area">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print rounded-t-lg bg-gray-50/50 border-b">
        <div className="flex items-center gap-3">
          <Banknote className="w-8 h-8 text-gray-600" />
          <CardTitle className='text-2xl font-bold tracking-tight'>Shop Revenue</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto bg-white"
          />
          <Button variant="outline" onClick={() => setSelectedDate('')} disabled={!selectedDate} className='bg-white'>Clear</Button>
           <Button onClick={handleDownloadPdf} disabled={shopRevenueData.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className='bg-gray-50'>
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
              {shopRevenueData.length > 0 && (
                  <TableFooter className="bg-gray-100 border-t">
                      <TableRow>
                          <TableCell colSpan={4} className="text-right text-base font-bold">Total</TableCell>
                          <TableCell className="text-right text-base font-bold">₹{totalForDate.toLocaleString()}</TableCell>
                      </TableRow>
                  </TableFooter>
              )}
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
