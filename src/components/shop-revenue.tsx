'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Banknote, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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
      const startOfDay = new Date(selectedDate + 'T00:00:00');
      const endOfDay = new Date(selectedDate + 'T23:59:59.999');
      
      deliveredOrders = deliveredOrders.filter(order => {
        const orderDate = order.createdAt.toDate();
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
    }

    return deliveredOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [orders, users, loading, selectedDate]);

  const totalItemsForDate = useMemo(() => {
    return shopRevenueData.reduce((sum, order) => sum + order.items.reduce((itemSum: any, item: any) => itemSum + item.quantity, 0), 0);
  }, [shopRevenueData]);
  
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    
    const title = selectedDate 
      ? `Shop Revenue for ${new Date(selectedDate+'T00:00:00').toLocaleDateString('en-GB')}`
      : 'Shop Revenue from All Delivered Orders';
      
    doc.text(title, 14, 15);

    const tableBody = shopRevenueData.flatMap(order => {
      const mainRow = [
        order.createdAt.toDate().toLocaleString('en-GB'),
        order.shopInfo.shopName || 'N/A',
        order.shopInfo.location || 'N/A',
        order.items.reduce((itemSum: any, item: any) => itemSum + item.quantity, 0)
      ];
      const itemRows = order.items.map((item: any) => [
          '',
          `  - ${item.name} (${item.size})`,
          `Qty: ${item.quantity}`,
          ''
      ]);
      return [mainRow, ...itemRows];
    });


    (doc as any).autoTable({
      startY: 20,
      head: [['Date & Time', 'Shop Name', 'Location / Item Details', 'Total Items']],
      body: tableBody,
      foot: [['', '', 'Total Items', totalItemsForDate.toLocaleString()]],
      footStyles: { fontStyle: 'bold', fillColor: [230, 230, 230], textColor: 0, halign: 'right' }
    });

    doc.save('shop_revenue_report.pdf');
  }

  return (
    <Card className="printable-area">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print rounded-t-lg bg-gray-50/50 border-b p-4">
        <div className="flex items-center gap-3">
          <Banknote className="w-8 h-8 text-gray-600" />
          <CardTitle className='text-xl md:text-2xl font-bold tracking-tight'>Shop Revenue</CardTitle>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto bg-white"
          />
          <Button variant="outline" onClick={() => setSelectedDate('')} disabled={!selectedDate} className='bg-white w-full sm:w-auto'>Clear</Button>
           <Button onClick={handleDownloadPdf} disabled={shopRevenueData.length === 0} className='w-full sm:w-auto'>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : shopRevenueData.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {shopRevenueData.map((order) => (
               <AccordionItem value={order.id} key={order.id} className="border-b">
                 <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]>svg]:text-primary">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-left w-full items-center">
                     <div className="font-medium">{order.createdAt.toDate().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                     <div className="font-medium">{order.shopInfo.shopName || 'N/A'}</div>
                     <div className="text-muted-foreground hidden md:block">{order.shopInfo.location || 'N/A'}</div>
                     <div className="font-bold text-right pr-4">{order.items.reduce((itemSum: any, item: any) => itemSum + item.quantity, 0)} items</div>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="p-4 bg-gray-50">
                    <h4 className="font-semibold mb-2 text-sm">Order Details</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.size}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </AccordionContent>
               </AccordionItem>
            ))}
             <div className="flex justify-end items-center p-4 bg-gray-100 font-bold text-base border-t">
                  <div className='mr-4'>Total Items for Selected Period:</div>
                  <div>{totalItemsForDate.toLocaleString()}</div>
              </div>
          </Accordion>
        ) : (
            <div className="text-center py-16 text-muted-foreground">
              {selectedDate ? 'No delivered orders on this date.' : 'No delivered orders yet.'}
            </div>
        )}
      </CardContent>
    </Card>
  );
}