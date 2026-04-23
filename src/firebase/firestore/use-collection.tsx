'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, FirestoreError, collection, CollectionReference } from 'firebase/firestore';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

export function useCollection<T>(query: Query<T> | CollectionReference<T> | null) {
    const [data, setData] = useState<T[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<FirestoreError | FirestorePermissionError | null>(null);

    useEffect(() => {
        if (!query) {
            setIsLoading(false);
            setData(null);
            return;
        }

        setIsLoading(true);
        const unsubscribe = onSnapshot(
            query,
            (querySnapshot) => {
                const data: T[] = [];
                querySnapshot.forEach((doc) => {
                    data.push({ ...(doc.data() as T), id: doc.id });
                });
                setData(data);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                const permissionError = new FirestorePermissionError({
                    path: query instanceof CollectionReference ? query.path : 'unknown query path',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
                setError(permissionError);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [query]);

    return { data, isLoading, error };
}
