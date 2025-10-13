'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const data = [
  { month: 'Jan', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Feb', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Mar', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Apr', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'May', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Jun', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Jul', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Aug', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Sep', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Oct', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Nov', sales: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'Dec', sales: Math.floor(Math.random() * 5000) + 1000 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Sales Overview</CardTitle>
        <CardDescription>Monthly sales performance for the current year.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
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
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
