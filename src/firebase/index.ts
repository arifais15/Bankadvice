
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
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
    const isNew = apps.length === 0;
    const app = isNew ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    if (isNew && process.env.NODE_ENV === 'development') {
        console.log("Connecting to Firebase Emulators...");
        try {
            connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
            connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
            console.log("Successfully connected to Firebase Emulators.");
        } catch (e) {
            console.error("Error connecting to Firebase Emulators:", e);
        }
    }

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
