
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Order } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function SalesChart() {
  const firestore = useFirestore();
  const [chartData, setChartData] = useState<any[]>([]);

  const ordersQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'orders') : null
  , [firestore]);
  
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  useEffect(() => {
    if (orders) {
      const monthlySales: { [key: string]: number } = {};
      const monthLabels = Array.from({ length: 12 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d.toLocaleString('default', { month: 'short' });
      }).reverse();

      monthLabels.forEach(month => {
        monthlySales[month] = 0;
      });

      orders.forEach(order => {
        const date = order.orderDate.toDate();
        const month = date.toLocaleString('default', { month: 'short' });
        if (monthlySales.hasOwnProperty(month)) {
          monthlySales[month] += order.totalAmount;
        }
      });

      const data = monthLabels.map(month => ({
        month,
        sales: monthlySales[month]
      }));

      setChartData(data);
    }
  }, [orders]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Sales Overview</CardTitle>
        <CardDescription>Monthly sales performance for the last 12 months.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="min-h-[350px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent />}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
