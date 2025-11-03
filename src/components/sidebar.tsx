'use client';

import { Button } from '@/components/ui/button';
import { BarChart, Package, Users, ShoppingCart, History, Home, LogOut } from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'shop';
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navItems = {
  admin: [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'All Orders', icon: ShoppingCart },
    { id: 'shops', name: 'Shops', icon: Users },
  ],
  shop: [
    { id: 'new_order', name: 'New Order', icon: Home },
    { id: 'order_history', name: 'My Orders', icon: History },
  ],
};

export function Sidebar({ role, activeSection, setActiveSection }: SidebarProps) {
  const items = navItems[role];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 shadow-xl md:flex">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="rounded-lg bg-blue-600 p-2 text-white">
          <Package className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">DMS ({role.toUpperCase()})</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 text-base"
            onClick={() => setActiveSection(item.id)}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Button>
        ))}
      </nav>
    </aside>
  );
}
