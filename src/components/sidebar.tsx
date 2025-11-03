'use client';

import { Button } from '@/components/ui/button';
import { BarChart, Package, Users, ShoppingCart, History, Home, User } from 'lucide-react';

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
    { id: 'profile', name: 'Profile', icon: User },
  ],
};

const GaneshaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
      <path d="M12,2C6.48,2,2,6.48,2,12c0,3.69,2.01,6.9,5,8.5V12h3V9c0-1.65,1.35-3,3-3s3,1.35,3,3v3h3v8.5c2.99-1.6,5-4.81,5-8.5 C22,6.48,17.52,2,12,2z M8.5,14C7.67,14,7,14.67,7,15.5S7.67,17,8.5,17S10,16.33,10,15.5S9.33,14,8.5,14z M12,11 c-0.55,0-1,0.45-1,1v1h2v-1C13,11.45,12.55,11,12,11z M15.5,14c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5 S16.33,14,15.5,14z" />
      <path d="M12,22c-0.5,0-1-0.2-1.4-0.6c-0.8-0.8-0.8-2,0-2.8l2.5-2.5c0.8-0.8,2-0.8,2.8,0s0.8,2,0,2.8l-2.5,2.5 C13,21.8,12.5,22,12,22z" />
    </svg>
);


export function Sidebar({ role, activeSection, setActiveSection }: SidebarProps) {
  const items = navItems[role];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 shadow-xl md:flex">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="rounded-lg bg-blue-600 p-2 text-white">
          <GaneshaIcon />
        </div>
        <h1 className="text-xl font-bold text-gray-800">{role === 'admin' ? 'Gajanan Enterprises' : 'Shop Portal'}</h1>
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
