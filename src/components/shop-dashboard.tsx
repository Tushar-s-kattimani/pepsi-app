'use client';

import { useState, useMemo } from 'react';
import { useUser, useCollection } from '@/firebase';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { NewOrder } from '@/components/new-order';
import { OrderHistory } from '@/components/order-history';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { ShopProfile } from '@/components/shop-profile';

export function ShopDashboard() {
  const [activeSection, setActiveSection] = useState('new_order');
  const { user } = useUser();

  const userOrdersQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, 'orders'), where('shopId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [user?.uid]);

  const { data: orders, loading: ordersLoading } = useCollection(userOrdersQuery);

  const { data: products, loading: productsLoading } = useCollection('products');

  const renderContent = () => {
    switch (activeSection) {
      case 'new_order':
        return <NewOrder products={products} loading={productsLoading} />;
      case 'order_history':
        return <OrderHistory orders={orders} loading={ordersLoading} />;
      case 'profile':
        return <ShopProfile />;
      default:
        return <NewOrder products={products} loading={productsLoading} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="shop" activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
