
'use client';
import { collection, writeBatch, getDocs, Firestore } from 'firebase/firestore';
import { products as mockProducts } from '@/lib/data';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

// NOTE: This is a one-time-use utility to seed the database.
// It is not part of the main application logic.
export async function seedDatabase(db: Firestore) {
  const productsCollection = collection(db, 'products');

  // Check if there's already data
  const snapshot = await getDocs(productsCollection).catch(error => {
    // This is a read operation, so we'll report it as such
    const contextualError = new FirestorePermissionError({
      path: productsCollection.path,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', contextualError);
    // Return null to prevent further execution
    return null;
  });

  if (!snapshot || !snapshot.empty) {
    // console.log('Products collection already seeded or not accessible. Skipping.');
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
    // Since batch writes don't give a specific failing doc,
    // we'll report the error on the collection path.
    const contextualError = new FirestorePermissionError({
      path: productsCollection.path,
      operation: 'write', // A batch can contain multiple operations. 'write' is a general term.
      requestResourceData: mockProducts, // We can send the whole array for context
    });
    errorEmitter.emit('permission-error', contextualError);
  }
}
