'use client';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * @param file The file to upload.
 * @param path The path in Storage where the file should be saved.
 * @returns A promise that resolves with the public download URL of the file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    // Depending on your error handling strategy, you might want to throw the error
    // or return a specific error message.
    throw new Error('Failed to upload file.');
  }
};

    