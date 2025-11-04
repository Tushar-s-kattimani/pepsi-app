
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin, User, Download, Printer } from 'lucide-react';
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
    setOrders(initialOrders);
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
  
  const ordersByLocation = useMemo(() => {
    const groupedByLocation: { [key: string]: any[] } = {};
    orders.forEach(order => {
      const shopUser = usersMap.get(order.shopId);
      // Skip orders from users who are not found (e.g., old data)
      if (!shopUser) return;
      
      const location = shopUser?.location || 'Unknown Location';
      if (!groupedByLocation[location]) {
        groupedByLocation[location] = [];
      }
      groupedByLocation[location].push(order);
    });

    const processedData = Object.entries(groupedByLocation).map(([location, locationOrders]) => {
      const ordersByShop = locationOrders.reduce((acc, order) => {
        const shopInfo = usersMap.get(order.shopId);
        // This check is redundant due to the check above but good for safety
        if (!shopInfo) {
          return acc;
        }

        if (!acc[order.shopId]) {
          acc[order.shopId] = {
            shopInfo: shopInfo,
            orders: [],
            aggregatedItems: new Map(),
            totalAmount: 0
          };
        }
        acc[order.shopId].orders.push(order);
        acc[order.shopId].totalAmount += order.totalAmount;
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const compositeKey = `${item.id}-${item.size}`;
            const existingItem = acc[order.shopId].aggregatedItems.get(compositeKey);
            if (existingItem) {
              existingItem.quantity += item.quantity;
            } else {
              acc[order.shopId].aggregatedItems.set(compositeKey, { ...item });
            }
          });
        }
        return acc;
      }, {} as any);

      return {
        location,
        totalOrders: locationOrders.length,
        shops: Object.values(ordersByShop).map((shopData: any) => ({
            ...shopData,
            orders: shopData.orders.sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis()),
            aggregatedItems: Array.from(shopData.aggregatedItems.values()),
        })),
      };
    });

    return processedData.sort((a, b) => a.location.localeCompare(b.location));
  }, [orders, usersMap]);

  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Shop Name,Phone Number,Location,Product Name,Product Size,Total Quantity\r\n";

    ordersByLocation.forEach(({ location, shops }) => {
      shops.forEach(({ shopInfo, aggregatedItems }) => {
        aggregatedItems.forEach((item: any) => {
          const row = [
            `"${shopInfo.shopName || ''}"`,
            `"${shopInfo.phoneNumber || ''}"`,
            `"${location}"`,
            `"${item.name}"`,
            `"${item.size}"`,
            item.quantity,
          ].join(',');
          csvContent += row + "\r\n";
        });
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
            {ordersByLocation.map(({ location, totalOrders, shops }) => (
              <AccordionItem value={location} key={location} className="border rounded-lg">
                <AccordionTrigger className="p-4 bg-gray-50 rounded-t-lg hover:no-underline no-print">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span className="text-lg font-semibold">{location}</span>
                    <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">{totalOrders} orders</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-2">
                  <Accordion type="multiple" className="w-full space-y-2">
                    {shops.map(({ shopInfo, orders, aggregatedItems, totalAmount }) => (
                      <AccordionItem value={shopInfo.id} key={shopInfo.id} className="border rounded-md">
                        <AccordionTrigger className="p-3 bg-white rounded-t-md hover:no-underline">
                            <div className="flex justify-between w-full items-center">
                                <div className='flex items-center gap-3'>
                                    <User className="h-5 w-5 text-gray-500" />
                                    <div className="text-left">
                                        <div className="font-semibold">{shopInfo.shopName}</div>
                                        <div className="text-xs text-gray-500">{shopInfo.phoneNumber}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">₹{totalAmount.toLocaleString()}</div>
                                    <div className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full inline-block mt-1">{orders.length} orders</div>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2 text-center text-sm">Aggregated Products</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Total Qty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aggregatedItems.map((item: any) => (
                                            <TableRow key={`${item.id}-${item.size}`}>
                                                <TableCell>{item.name} ({item.size})</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className='no-print'>
                                    <h4 className="font-semibold mb-2 text-center text-sm">Individual Orders</h4>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order: any) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="text-xs">
                                                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
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
                                                </TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
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
