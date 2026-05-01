'use client';

import React, { useMemo } from 'react';
import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * A provider component that initializes Firebase once on the client side
 * and provides the instances to the rest of the app.
 */
export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Stabilize Firebase instances to avoid re-initialization and render loops
  const instances = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider value={instances}>
      {children}
      <FirebaseErrorListener />
    </FirebaseProvider>
  );
};
