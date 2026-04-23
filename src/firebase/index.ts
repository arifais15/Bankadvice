import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
    if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);

        if (process.env.NODE_ENV === 'development') {
            console.log("Connecting to Firebase Emulators...");
            try {
                connectAuthEmulator(auth, `http://127.0.0.1:9099`, { disableWarnings: true });
                connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
                console.log("Successfully connected to Firebase Emulators.");
            } catch (e) {
                console.error("Error connecting to Firebase Emulators:", e);
            }
        }
    } else {
        firebaseApp = getApp();
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);
    }
  return { firebaseApp, auth, firestore };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

export { initializeFirebase };
