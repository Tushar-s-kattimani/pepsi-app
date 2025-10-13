'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const statusColorMap: { [key: string]: string } = {
  'In Stock': 'bg-green-500',
  'Low Stock': 'bg-yellow-400',
  'Out of Stock': 'bg-red-500',
};

const progressColorMap: { [key: string]: string } = {
  'In Stock': 'bg-green-500',
  'Low Stock': 'bg-yellow-400',
  'Out of Stock': 'bg-red-500',
};

const MAX_QUANTITY = 2000;

export default function StockPage() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'products'), orderBy('name')) : null
  , [firestore]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const getStockStatus = (quantity: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 500) return 'Low Stock';
    return 'In Stock';
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Stock Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your current inventory levels in real-time.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Overview of all products in stock.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="w-[20%]">Stock Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading stock levels...</p>
                  </TableCell>
                </TableRow>
              )}
               {!isLoading && products?.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center">
                        <p className="text-muted-foreground">No stock data found.</p>
                    </TableCell>
                 </TableRow>
              )}
              {products?.map((item) => {
                const status = getStockStatus(item.stock);
                const stockPercentage = Math.round((item.stock / MAX_QUANTITY) * 100);

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-white hover:text-black',
                          statusColorMap[status]
                        )}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={stockPercentage}
                          className="h-2"
                          indicatorClassName={cn(progressColorMap[status])}
                        />
                        <span className="text-xs text-muted-foreground">
                          {stockPercentage}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Add indicatorClassName to Progress component props
declare module '@/components/ui/progress' {
  interface ProgressProps
    extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    indicatorClassName?: string;
  }
}
