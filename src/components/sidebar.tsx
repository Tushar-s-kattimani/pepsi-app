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

const PepsiBottleLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    {/* Bottle Shape */}
    <path d="M35 10 L 65 10 L 70 30 L 70 90 L 30 90 L 30 30 Z" fill="#E0E0E0" stroke="#B0B0B0" strokeWidth="2"/>
    <path d="M38 10 L 62 10 L 62 4 L 38 4 Z" fill="#A0A0A0" />

    {/* Pepsi-style Logo */}
    <circle cx="50" cy="55" r="20" fill="#FFFFFF"/>
    <path d="M30 55 A 20 20 0 0 1 70 55" fill="#D52B1E"/>
    <path d="M30 55 C 40 62, 60 48, 70 55 A 20 20 0 0 0 30 55 Z" fill="#0039A6"/>
  </svg>
);


export function Sidebar({ role, activeSection, setActiveSection }: SidebarProps) {
  const items = navItems[role];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 shadow-xl md:flex">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="h-10 w-10 rounded-lg bg-primary p-1.5 text-primary-foreground">
          <PepsiBottleLogo />
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
