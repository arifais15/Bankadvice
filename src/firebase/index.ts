import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services and returns the instances.
 * This function ensures that Firebase is only initialized once and only on the client.
 * It uses a stateless approach inside the function to avoid circular dependency and initialization errors.
 */
export function initializeFirebase() {
    if (typeof window === 'undefined') {
        return { firebaseApp: null as any, auth: null as any, firestore: null as any };
    }

    const apps = getApps();
    const app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    
    return { firebaseApp: app, auth, firestore };
}

// Barrel exports for Firebase functionality
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
