'use client';

import { Bar, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Package, ShoppingCart, Users, Loader2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement } from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement);

export function AdminOverview({ orders = [], products = [], users = [], loading }: { orders: any[], products: any[], users: any[], loading: boolean }) {

  const chartData = useMemo(() => {
    const monthlySales: { [key: string]: number } = {};
    const productSales: { [key: string]: number } = {};
    
    orders.forEach(order => {
      // Sales Trend Data
      if (order.createdAt?.toDate) {
        const date = order.createdAt.toDate();
        const month = date.toLocaleString('default', { month: 'long' });
        monthlySales[month] = (monthlySales[month] || 0) + order.totalAmount;
      }

      // Top Products Data
      order.items.forEach((item: any) => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });

    const salesLabels = Object.keys(monthlySales);
    const salesValues = Object.values(monthlySales);

    const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a).slice(0, 5);
    const topProductLabels = sortedProducts.map(([name]) => name);
    const topProductValues = sortedProducts.map(([, quantity]) => quantity);

    return {
      salesData: {
        labels: salesLabels,
        datasets: [{
          label: 'Monthly Sales',
          data: salesValues,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }],
      },
      productSalesData: {
        labels: topProductLabels,
        datasets: [{
          label: 'Units Sold',
          data: topProductValues,
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          borderColor: 'rgba(234, 179, 8, 1)',
          borderWidth: 1,
        }],
      },
    };
  }, [orders]);


  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalShops = users.filter(u => u.role === 'shop').length;


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShops}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.salesData.labels.length > 0 ? (
                <Line data={chartData.salesData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">No sales data available.</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Units Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
               {chartData.productSalesData.labels.length > 0 ? (
                <Bar data={chartData.productSalesData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                 <div className="flex h-full items-center justify-center text-gray-500">No product sales data available.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
