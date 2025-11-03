'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, MapPin } from 'lucide-react';
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
    const grouped: { [key: string]: any[] } = {};
    orders.forEach(order => {
      const shopUser = usersMap.get(order.shopId);
      const location = shopUser?.location || 'Unknown Location';
      if (!grouped[location]) {
        grouped[location] = [];
      }
      grouped[location].push(order);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
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
            {ordersByLocation.map(([location, locationOrders]) => (
              <AccordionItem value={location} key={location} className="border rounded-lg">
                <AccordionTrigger className="p-4 bg-gray-50 rounded-t-lg hover:no-underline">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span className="text-lg font-semibold">{location}</span>
                    <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-full">{locationOrders.length} orders</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Update Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locationOrders.map((order) => {
                        const shopUser = usersMap.get(order.shopId);
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                            <TableCell>{shopUser?.shopName || 'N/A'}</TableCell>
                            <TableCell>{shopUser?.phoneNumber || 'N/A'}</TableCell>
                            <TableCell>{order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Select onValueChange={(value) => handleStatusChange(order.id, value)} defaultValue={order.status}>
                                <SelectTrigger className="w-[120px]">
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
                        )
                      })}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
