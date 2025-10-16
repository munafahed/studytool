"use client";

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, type Firestore, collection, onSnapshot, doc, type DocumentReference, type CollectionReference, type Query } from 'firebase/firestore';

// We'll replace this with the actual config later
const firebaseConfig = {
  "projectId": "studio-3877062640-1afd2",
  "appId": "1:22079065437:web:3c428f5ff06dd0ea6dacb4",
  "apiKey": "AIzaSyBDPIZxIWNoZ0KOJY1fzQNYOWw6lEAJlrI",
  "authDomain": "studio-3877062640-1afd2.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "22079065437"
};

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function initializeFirebase() {
  if (getApps().length) {
    const app = getApps()[0];
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { app, auth, firestore };
  }
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { app, auth, firestore };
}


export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [firebase, setFirebase] = useState<FirebaseContextValue>({
    app: null,
    auth: null,
    firestore: null,
  });

  useEffect(() => {
    const { app, auth, firestore } = initializeFirebase();
    setFirebase({ app, auth, firestore });
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
};

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);
    useEffect(() => {
        setFirebase(initializeFirebase());
    }, []);

    if (!firebase) {
        // You can return a loader here
        return null;
    }
    return <FirebaseProvider>{children}</FirebaseProvider>
}


export const useFirebase = () => {
  return useContext(FirebaseContext);
};

export const useFirebaseApp = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useFirebaseApp must be used within a FirebaseProvider");
    }
    return context.app;
}

export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useAuth must be used within a FirebaseProvider");
    }
    return context.auth;
}

export const useFirestore = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error("useFirestore must be used within a FirebaseProvider");
    }
    return context.firestore;
}

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
        setIsLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, isLoading };
};

// Firestore hooks
export const useDoc = <T,>(ref: DocumentReference<T> | null) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!ref) {
            setLoading(false);
            return;
        };
        const unsubscribe = onSnapshot(ref, (doc) => {
            if (doc.exists()) {
                setData(doc.data());
            } else {
                setData(null);
            }
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [ref]);

    return { data, loading, error };
}

export const useCollection = <T,>(ref: CollectionReference<T> | Query<T> | null) => {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!ref) {
            setLoading(false);
            return;
        }
        const unsubscribe = onSnapshot(ref, (snapshot) => {
            const result: T[] = [];
            snapshot.forEach(doc => {
                result.push({ ...doc.data(), id: doc.id });
            });
            setData(result);
            setLoading(false);
        }, (err) => {
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [ref]);

    return { data, loading, error };
}
