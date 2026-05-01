import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services and returns the instances.
 * This function ensures that Firebase is only initialized once.
 */
export function initializeFirebase() {
    let app: FirebaseApp;
    let authInstance: Auth;
    let db: Firestore;

    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        db = getFirestore(app);
    } else {
        app = getApp();
        authInstance = getAuth(app);
        db = getFirestore(app);
    }
    
    return { firebaseApp: app, auth: authInstance, firestore: db };
}

// Barrel exports for Firebase functionality
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
