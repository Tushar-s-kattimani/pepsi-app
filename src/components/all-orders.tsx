
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Download, Printer, Calendar } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const statusColors: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
};

export function AllOrders({ orders: initialOrders = [], users = [], loading }: { orders: any[], users: any[], loading: boolean }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    setOrders(initialOrders.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
  }, [initialOrders]);


  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const orderRef = doc(db, 'orders', orderId);
    if (newStatus === 'Delivered') {
      try {
        await deleteDoc(orderRef);
        setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        toast({ title: 'Success', description: 'Order marked as delivered and removed.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to delete order: ${error.message}` });
      }
    } else {
      try {
        await updateDoc(orderRef, { status: newStatus });
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
        toast({ title: 'Success', description: 'Order status updated.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `Failed to update status: ${error.message}` });
      }
    }
  };

  const usersMap = useMemo(() => {
    const map = new Map();
    users.forEach(user => map.set(user.id, user));
    return map;
  }, [users]);
  
  const ordersByDate = useMemo(() => {
    const groupedByDate: { [key: string]: any[] } = {};
    orders.forEach(order => {
        if (!order.createdAt?.toDate) return;
        const dateStr = order.createdAt.toDate().toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = [];
        }
        groupedByDate[dateStr].push(order);
    });

    const processedData = Object.entries(groupedByDate).map(([date, dateOrders]) => {
      const ordersByShop = dateOrders.reduce((acc, order) => {
        const shopInfo = usersMap.get(order.shopId);
        if (!shopInfo) {
          return acc;
        }
        if (!acc[order.shopId]) {
          acc[order.shopId] = {
            shopInfo: shopInfo,
            orders: [],
          };
        }
        acc[order.shopId].orders.push(order);
        return acc;
      }, {} as any);

      return {
        date,
        totalOrders: dateOrders.length,
        shops: Object.values(ordersByShop).map((shopData: any) => ({
            ...shopData,
            orders: shopData.orders.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()),
        })),
      };
    });

    return processedData.sort((a, b) => b.date.localeCompare(a.date));
  }, [orders, usersMap]);

  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Order ID,Shop Name,Phone Number,Location,Product Name,Size,Quantity,Price,Total Amount,Status\r\n";

    orders.forEach((order) => {
        const shopInfo = usersMap.get(order.shopId);
        if(!shopInfo) return;
        order.items.forEach((item: any) => {
             const row = [
                `"${order.createdAt?.toDate().toLocaleDateString()}"`,
                `"${order.id}"`,
                `"${shopInfo.shopName || ''}"`,
                `"${shopInfo.phoneNumber || ''}"`,
                `"${shopInfo.location || ''}"`,
                `"${item.name}"`,
                `"${item.size}"`,
                item.quantity,
                item.price,
                order.totalAmount,
                order.status,
            ].join(',');
            csvContent += row + "\r\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => {
    window.print();
  }


  return (
    <Card className='print-only-card'>
      <CardHeader className="flex flex-row items-center justify-between no-print">
        <CardTitle>All Customer Orders</CardTitle>
        <div className="flex items-center gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && initialOrders.length === 0 ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4">
            {ordersByDate.map(({ date, totalOrders, shops }) => (
              <AccordionItem value={date} key={date} className="border rounded-lg">
                <AccordionTrigger className="p-4 bg-gray-50 rounded-t-lg hover:no-underline no-print">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-lg font-semibold">{new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">{totalOrders} orders</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-2">
                  <Accordion type="multiple" className="w-full space-y-2">
                    {shops.map(({ shopInfo, orders }) => (
                      <AccordionItem value={shopInfo.id} key={shopInfo.id} className="border rounded-md">
                        <AccordionTrigger className="p-3 bg-white rounded-t-md hover:no-underline">
                            <div className="flex justify-between w-full items-center">
                                <div className='flex items-center gap-3'>
                                    <User className="h-5 w-5 text-gray-500" />
                                    <div className="text-left">
                                        <div className="font-semibold">{shopInfo.shopName} ({shopInfo.location})</div>
                                        <div className="text-xs text-gray-500">{shopInfo.phoneNumber}</div>
                                    </div>
                                </div>
                                <div className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full inline-block mt-1">{orders.length} order(s) on this day</div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                            {orders.map((order: any) => (
                                <div key={order.id} className="mb-4 border rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="font-bold text-sm">Order ID:</span>
                                            <span className="font-mono text-xs ml-2">{order.id.substring(0,8)}</span>
                                        </div>
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.items.map((item: any) => (
                                            <TableRow key={`${item.id}-${item.size}`}>
                                                <TableCell>{item.name} ({item.size})</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>₹{item.price.toFixed(2)}</TableCell>
                                                <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="font-bold text-lg">
                                            Total: ₹{order.totalAmount.toLocaleString()}
                                        </div>
                                        <div className="no-print">
                                            <Select onValueChange={(value) => handleStatusChange(order.id, value)} defaultValue={order.status}>
                                                <SelectTrigger className="w-[120px] h-8">
                                                <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                <SelectItem value="Delivered">Delivered</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

