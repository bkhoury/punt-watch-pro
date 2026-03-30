import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase/clientApp";

export async function getPunts(db = db, filters = {}) {
  let q = query(collection(db, "(default)"));

  // q = applyPuntQueryFilters(q, filters);
  const results = await getDocs(q);
  return results.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toMillis() ?? null,
    };
  });
}

function applyPuntQueryFilters(q) {
  q = query(q, orderBy("createdAt", "desc"));
  return q;
}

export function getPuntsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "(default)"));
  q = applyPuntQueryFilters(q, filters);

  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() ?? null,
      };
    });

    cb(results);
  });
}
