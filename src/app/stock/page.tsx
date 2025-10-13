import { stockItems } from '@/lib/data';
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

const statusColorMap: { [key: string]: string } = {
  'In Stock': 'bg-green-500',
  'Low Stock': 'bg-yellow-400',
  'Out of Stock': 'bg-red-500',
};

const progressColorMap: { [key: string]: string } = {
    'In Stock': 'bg-green-500',
    'Low Stock': 'bg-yellow-400',
    'Out of Stock': 'bg-red-500',
}

export default function StockPage() {
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
              {stockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={cn("text-white hover:text-black", statusColorMap[item.status])}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Progress 
                            value={(item.quantity / item.maxQuantity) * 100} 
                            className="h-2"
                            indicatorClassName={cn(progressColorMap[item.status])}
                        />
                        <span className="text-xs text-muted-foreground">{Math.round((item.quantity / item.maxQuantity) * 100)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Add indicatorClassName to Progress component props
declare module "@/components/ui/progress" {
    interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
        indicatorClassName?: string
    }
}
