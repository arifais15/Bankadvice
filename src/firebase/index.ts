
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services and returns the instances.
 * This function ensures that Firebase is only initialized once and only on the client.
 * Includes Firestore Offline Persistence for local/offline PC usage.
 */
export function initializeFirebase() {
    if (typeof window === 'undefined') {
        return { firebaseApp: null as any, auth: null as any, firestore: null as any };
    }

    const apps = getApps();
    const app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    // Enable offline persistence for PC usage
    enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time.
            console.warn('Firestore persistence failed: Multiple tabs open.');
        } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the features required to enable persistence
            console.warn('Firestore persistence failed: Browser not supported.');
        }
    });
    
    return { firebaseApp: app, auth, firestore };
}

// Barrel exports for Firebase functionality
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
