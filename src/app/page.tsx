import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { RecentOrders } from '@/components/dashboard/recent-orders';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Sales Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's a real-time overview of your sales performance.
        </p>
      </header>
      <StatsCards />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <div className="xl:col-span-1">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
