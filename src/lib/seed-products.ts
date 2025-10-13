
'use client';
import { collection, writeBatch, getDocs, Firestore } from 'firebase/firestore';
import { products as mockProducts } from '@/lib/data';

// NOTE: This is a one-time-use utility to seed the database.
// It is not part of the main application logic.
export async function seedDatabase(db: Firestore) {
  const productsCollection = collection(db, 'products');

  // Check if there's already data
  const snapshot = await getDocs(productsCollection);
  if (!snapshot.empty) {
    console.log('Products collection already seeded. Skipping.');
    return;
  }

  console.log('Seeding products collection...');
  const batch = writeBatch(db);

  mockProducts.forEach((product) => {
    const docRef = collection(db, 'products').doc(); // Auto-generate ID
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log('Products collection seeded successfully!');
  } catch (error) {
    console.error('Error seeding products collection: ', error);
  }
}
