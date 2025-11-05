'use client';

import { Button } from '@/components/ui/button';
import { BarChart, Package, Users, ShoppingCart, History, Home, User, Banknote, Calendar, ClipboardList } from 'lucide-react';

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
    { id: 'shop-revenue', name: 'Shop Revenue', icon: Banknote },
    { id: 'stock-report', name: 'Stock Report', icon: ClipboardList },
    { id: 'laborers', name: 'Laborers', icon: Users },
    { id: 'attendance', name: 'Labor Attendance', icon: Calendar },
  ],
  shop: [
    { id: 'new_order', name: 'New Order', icon: Home },
    { id: 'order_history', name: 'My Orders', icon: History },
    { id: 'profile', name: 'Profile', icon: User },
  ],
};

const PepsiBottleLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(2px 4px 3px rgba(0,0,0,0.3))' }}>
        <defs>
            <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#cae4fb' }} />
                <stop offset="50%" style={{ stopColor: '#ffffff' }} />
                <stop offset="100%" style={{ stopColor: '#cae4fb' }} />
            </linearGradient>
            <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#A0A0A0' }} />
                <stop offset="100%" style={{ stopColor: '#606060' }} />
            </linearGradient>
        </defs>
        
        {/* Bottle Body */}
        <path d="M35 15 L 65 15 C 70 20, 72 25, 70 35 L 70 90 L 30 90 L 30 35 C 28 25, 30 20, 35 15 Z" fill="url(#bottleGradient)" stroke="#5A7D9B" strokeWidth="2"/>
        
        {/* Bottle Cap */}
        <path d="M38 15 L 62 15 L 62 5 L 38 5 Z" fill="url(#capGradient)" stroke="#404040" strokeWidth="1"/>
        
        {/* Pepsi Logo */}
        <circle cx="50" cy="55" r="20" fill="#FFFFFF" stroke="#0039A6" strokeWidth="1.5"/>
        <path d="M30 55 A 20 20 0 0 1 70 55" fill="#D52B1E"/>
        <path d="M30 55 C 40 62, 60 48, 70 55 A 20 20 0 0 0 30 55 Z" fill="#0039A6"/>

        {/* Shine */}
        <path d="M38 20 C 42 40, 42 70, 38 90" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);


export function Sidebar({ role, activeSection, setActiveSection }: SidebarProps) {
  const items = navItems[role];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white p-4 shadow-xl md:flex">
      <div className="mb-8 flex items-center gap-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 p-4 shadow-md">
        <div className="h-10 w-10 flex-shrink-0">
          <PepsiBottleLogo />
        </div>
        <h1 className="text-xl font-bold text-gray-800 text-shadow-md">{role === 'admin' ? 'Gajanan Enterprises' : 'Gajanan Enterprise shop portal'}</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start items-center gap-3 text-base h-12 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md font-bold'
                  : 'font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : ''}`} />
              {item.name}
            </Button>
          )
        })}
      </nav>
    </aside>
  );
}
