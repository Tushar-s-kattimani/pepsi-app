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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
            <linearGradient id="gradientTrunk" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:"#FFD700",stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#FFA500",stopOpacity:1}} />
            </linearGradient>
            <linearGradient id="gradientHead" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:"#FFECB3",stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:"#FFCC80",stopOpacity:1}} />
            </linearGradient>
            <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
            </filter>
        </defs>

        <path d="M50 20 C 70 5 90 25 90 50 C 90 75 70 95 50 90 C 30 95 10 75 10 50 C 10 25 30 5 50 20 Z" 
                fill="url(#gradientHead)" stroke="#6D4C41" strokeWidth="2" filter="url(#shadow)"/>

        <path d="M40 15 Q 20 0 5 40 Q 15 70 35 60 Z" fill="#FFB74D" stroke="#6D4C41" strokeWidth="1.5"/>
        <path d="M60 15 Q 80 0 95 40 Q 85 70 65 60 Z" fill="#FFB74D" stroke="#6D4C41" strokeWidth="1.5"/>

        <path d="M50 50 C 55 65 45 80 50 85 C 55 90 60 75 55 60 Z" 
                fill="url(#gradientTrunk)" stroke="#6D4C41" strokeWidth="2"/>

        <circle cx="40" cy="40" r="4" fill="#212121"/>
        <circle cx="60" cy="40" r="4" fill="#212121"/>

        <path d="M50 30 L53 35 Q50 40 47 35 L50 30 Z" fill="#D32F2F"/>
        
        <path d="M60 55 Q 65 50 60 45 L 65 48 Z" fill="#FFFFFF" stroke="#6D4C41" strokeWidth="1.5"/>
        <path d="M40 55 Q 35 50 40 45 L 35 48 Z" fill="#FFFFFF" stroke="#6D4C41" strokeWidth="1.5"/>
    </svg>
);


export function Sidebar({ role, activeSection, setActiveSection }: SidebarProps) {
  const items = navItems[role];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 shadow-xl md:flex">
      <div className="mb-8 flex items-center gap-3 border-b pb-4">
        <div className="h-10 w-10 rounded-lg bg-primary p-1.5 text-primary-foreground">
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
