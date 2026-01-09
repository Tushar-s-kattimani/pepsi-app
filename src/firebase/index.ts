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

    const memoizedQuery = useMemo(() => {
        if (!pathOrQuery) return null;
        if (typeof pathOrQuery === 'string') {
            return query(collection(db, pathOrQuery));
        }
        return pathOrQuery;
    }, [pathOrQuery]);


    useEffect(() => {
        if (!memoizedQuery) {
            setData([]);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(memoizedQuery,
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

        return () => unsubscribe();
    }, [memoizedQuery]);
    
    return { data, loading };
};

export * from './provider';
export * from './auth/use-user';
