'use client';

import { useState, useEffect, useMemo } from 'react';
import { onSnapshot, query, type Query, type DocumentData, type CollectionReference } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

// A hook for memoizing a Firestore query object.
// This is important to prevent re-rendering loops.
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

export function useCollection<T extends { id: string } = DocumentData & { id: string }>(
  q: Query<Omit<T, 'id'>> | CollectionReference<Omit<T, 'id'>> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(docs as T[]);
        setIsLoading(false);
      },
      async (err) => {
        console.error(err);
        const path = 'path' in q ? q.path : 'unknown collection';
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, isLoading };
}
