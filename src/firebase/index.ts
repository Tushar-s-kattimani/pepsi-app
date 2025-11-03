'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, doc } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';
import { firebaseConfig, db } from './config';

// --- INITIALIZATION ---
let firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(firebaseApp);

export { db, auth, firebaseApp };

// --- HOOKS ---
export const useCollection = (pathOrQuery: string | any) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pathOrQuery) {
            setData([]);
            setLoading(false);
            return;
        }

        let unsubscribe: () => void;
        try {
            const queryToRun = typeof pathOrQuery === 'string' 
                ? query(collection(db, pathOrQuery)) 
                : pathOrQuery;

            unsubscribe = onSnapshot(queryToRun, 
                (snapshot) => {
                    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setData(docs);
                    setLoading(false);
                },
                (error) => {
                    console.error(`Error fetching collection:`, error);
                    setData([]);
                    setLoading(false);
                }
            );
        } catch (error) {
            console.error("Error setting up collection listener:", error);
            setData([]);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [pathOrQuery]);
    
    return { data, loading };
};

export * from './provider';
export * from './auth/use-user';
