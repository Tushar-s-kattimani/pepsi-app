import { orders } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const recentOrders = orders.slice(0, 5);

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Orders</CardTitle>
        <CardDescription>You have {orders.length} orders in total.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentOrders.map((order, index) => (
          <div key={order.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${index}`} alt="Avatar" />
              <AvatarFallback>{order.shopName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{order.shopName}</p>
              <p className="text-sm text-muted-foreground">{order.id}</p>
            </div>
            <div className="ml-auto font-medium">
              +${order.total.toFixed(2)}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/orders">
            View All Orders <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
