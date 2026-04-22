'use client';

import { FirebaseProvider } from './provider';

// This is a wrapper to ensure that the FirebaseProvider is only rendered on the client.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
