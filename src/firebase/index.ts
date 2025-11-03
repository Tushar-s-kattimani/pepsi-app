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
export const useCollection = (path: string | any) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const stableQuery = useMemo(() => {
        if (!path) return null;
        if (typeof path === 'string') {
            return query(collection(db, path));
        }
        return path;
    }, [path && typeof path !== 'string' ? path.path : path]);

    useEffect(() => {
        if (!stableQuery) {
            setData([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(stableQuery, 
            (snapshot) => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setData(docs);
                setLoading(false);
            },
            (error) => {
                console.error(`Error fetching collection:`, error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [stableQuery]);
    
    return { data, loading };
};

export * from './provider';
export * from './auth/use-user';
