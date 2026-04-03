import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  setDoc,
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
  let q = query(collection(db, "reps"));
  q = applyPuntQueryFilters(q, filters);
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

function applyPuntQueryFilters(q, filters = {}) {
  if (filters.uid) {
    q = query(q, where("uid", "==", filters.uid));
  }
  q = query(q, orderBy("createdAt", "desc"));
  return q;
}

export async function getUsers() {
  const results = await getDocs(query(collection(db, "users")));
  return results.docs.map((snap) => ({ uid: snap.id, ...snap.data() }));
}

export async function getUsersByUids(uids) {
  if (!uids.length) return {};
  const results = await Promise.all(
    uids.map((uid) => getDoc(doc(db, "users", uid)))
  );
  const map = {};
  results.forEach((snap) => {
    if (snap.exists()) map[snap.id] = snap.data();
  });
  return map;
}

export async function updateUserDoc(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function claimPunt(puntId, uid) {
  await updateDoc(doc(db, "reps", puntId), { uid });
}

export function getPuntsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "reps"));
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
