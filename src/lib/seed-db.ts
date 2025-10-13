
'use client';
import { collection, writeBatch, getDocs, Firestore, Timestamp } from 'firebase/firestore';
import { orders as mockOrders } from '@/lib/data';

// NOTE: This is a one-time-use utility to seed the database.
// It is not part of the main application logic.
export async function seedDatabase(db: Firestore) {
  const ordersCollection = collection(db, 'orders');

  // Check if there's already data
  const snapshot = await getDocs(ordersCollection);
  if (!snapshot.empty) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding database...');
  const batch = writeBatch(db);

  mockOrders.forEach((order) => {
    const docRef = collection(db, 'orders');
    const orderData = {
      shopId: order.shopName.toLowerCase().replace(/\s/g, '-'),
      shopName: order.shopName,
      orderDate: Timestamp.fromDate(new Date(order.date)),
      status: order.status,
      totalAmount: order.total,
      itemCount: order.itemCount,
    }
    // In a real app, you'd use addDoc, but we need a specific ID for the mock data
    batch.set(docRef.doc(order.id), orderData);
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
}
