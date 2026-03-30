"use client";

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

export const firebaseApp = initializeApp(firebaseConfig);
// export const firebaseApp = initializeApp();

export const auth = getAuth(firebaseApp);
// connectAuthEmulator(auth, "http://127.0.0.1:9098");
export const db = getFirestore(firebaseApp);
// connectFirestoreEmulator(db, '127.0.0.1', 8081);
export const storage = getStorage(firebaseApp);
