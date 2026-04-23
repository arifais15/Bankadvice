'use client';

import { initializeFirebase, FirebaseProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const { firebaseApp, auth, firestore } = initializeFirebase();

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <FirebaseProvider value={{ firebaseApp, auth, firestore }}>
      {children}
      <FirebaseErrorListener />
    </FirebaseProvider>
  );
};
