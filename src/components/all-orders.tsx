'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin, ShoppingCart, User } from 'lucide-react';
import { useMemo } from 'react';

const statusColors: { [key: string]: string } = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
};

export function AllOrders({ orders = [], users = [], loading }: { orders: any[], users: any[], loading: boolean }) {
  const { toast } = useToast();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast({ title: 'Success', description: 'Order status updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
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
      const location = shopUser?.location || 'Unknown Location';
      if (!groupedByLocation[location]) {
        groupedByLocation[location] = [];
      }
      groupedByLocation[location].push(order);
    });

    const processedData = Object.entries(groupedByLocation).map(([location, locationOrders]) => {
      const ordersByShop = locationOrders.reduce((acc, order) => {
        if (!acc[order.shopId]) {
          acc[order.shopId] = {
            shopInfo: usersMap.get(order.shopId),
            orders: [],
            aggregatedItems: new Map(),
          };
        }
        acc[order.shopId].orders.push(order);
        order.items.forEach((item: any) => {
          const existingItem = acc[order.shopId].aggregatedItems.get(item.id);
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            acc[order.shopId].aggregatedItems.set(item.id, { ...item });
          }
        });
        return acc;
      }, {} as any);

      return {
        location,
        totalOrders: locationOrders.length,
        shops: Object.values(ordersByShop).map((shopData: any) => ({
            ...shopData,
            aggregatedItems: Array.from(shopData.aggregatedItems.values()),
        })),
      };
    });

    return processedData.sort((a, b) => a.location.localeCompare(b.location));
  }, [orders, usersMap]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Customer Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4">
            {ordersByLocation.map(({ location, totalOrders, shops }) => (
              <AccordionItem value={location} key={location} className="border rounded-lg">
                <AccordionTrigger className="p-4 bg-gray-50 rounded-t-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span className="text-lg font-semibold">{location}</span>
                    <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">{totalOrders} orders</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-2">
                  <Accordion type="multiple" className="w-full space-y-2">
                    {shops.map(({ shopInfo, orders, aggregatedItems }) => (
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
                                <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full">{orders.length} orders</span>
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
                                            <TableRow key={item.id}>
                                                <TableCell>{item.name} ({item.size})</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                            </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 text-center text-sm">Individual Orders</h4>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.map((order: any) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">{order.id.substring(0,8)}</TableCell>
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
