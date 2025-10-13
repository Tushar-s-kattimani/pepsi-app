
'use client';
import { collection, writeBatch, getDocs, Firestore, Timestamp, doc } from 'firebase/firestore';
import { orders as mockOrders } from '@/lib/data';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

// NOTE: This is a one-time-use utility to seed the database.
// It is not part of the main application logic.
export async function seedDatabase(db: Firestore) {
  const ordersCollection = collection(db, 'orders');

  // Check if there's already data
  const snapshot = await getDocs(ordersCollection).catch(error => {
    const contextualError = new FirestorePermissionError({
        path: ordersCollection.path,
        operation: 'list',
    });
    errorEmitter.emit('permission-error', contextualError);
    return null;
  });

  if (!snapshot || !snapshot.empty) {
    // console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding database...');
  const batch = writeBatch(db);

  const ordersData = mockOrders.map(order => ({
    id: order.id,
    data: {
      shopId: order.shopName.toLowerCase().replace(/\s/g, '-'),
      shopName: order.shopName,
      orderDate: Timestamp.fromDate(new Date(order.date)),
      status: order.status,
      totalAmount: order.total,
      itemCount: order.itemCount,
    }
  }));

  ordersData.forEach(order => {
    const docRef = doc(db, 'orders', order.id);
    batch.set(docRef, order.data);
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database: ', error);
    const contextualError = new FirestorePermissionError({
        path: ordersCollection.path,
        operation: 'write',
        requestResourceData: ordersData.map(o => o.data),
    });
    errorEmitter.emit('permission-error', contextualError);
  }
}
