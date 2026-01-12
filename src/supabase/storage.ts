'use client';

import { supabase } from './config';

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * @param file The file to upload.
 * @param path The path in the bucket where the file should be saved.
 * @returns A promise that resolves with the public download URL of the file.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const bucket = 'images'; // Assumes you have a bucket named 'images'

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite existing file with the same name
      });

    if (error) {
      console.error("Error uploading file to Supabase:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    if (!publicUrlData) {
        throw new Error('Failed to get public URL for the uploaded file.');
    }
      
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Error during file upload process:", error);
    throw new Error('Failed to upload file.');
  }
};
