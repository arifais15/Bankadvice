'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, DocumentData, FirestoreError, DocumentReference } from 'firebase/firestore';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

export function useDoc<T>(docRef: DocumentReference<T> | null) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | FirestorePermissionError | null>(null);

    useEffect(() => {
        if (!docRef) {
            setIsLoading(false);
            setData(null);
            return;
        }
        
        setIsLoading(true);

        const unsubscribe = onSnapshot(
            docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setData({ ...(docSnap.data() as T), id: docSnap.id });
                } else {
                    setData(null);
                }
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
                setError(permissionError);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [docRef]);

    return { data, isLoading, error };
}
