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

import { deleteDoc } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase/clientApp";

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

export function getCommentsSnapshot(puntId, cb) {
  const q = query(
    collection(db, "reps", puntId, "comments"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis() ?? null })));
  });
}

export async function deleteComment(puntId, commentId) {
  await deleteDoc(doc(db, "reps", puntId, "comments", commentId));
}

export async function addComment(puntId, uid, text) {
  await addDoc(collection(db, "reps", puntId, "comments"), {
    uid,
    text,
    createdAt: Timestamp.now(),
  });
}

export async function deletePunt(puntId, videoURL) {
  await deleteDoc(doc(db, "reps", puntId));
  if (videoURL) {
    try {
      const path = decodeURIComponent(videoURL.split("/o/")[1].split("?")[0]);
      await deleteObject(storageRef(storage, path));
    } catch (err) {
      console.warn("Could not delete video from storage:", err);
    }
  }
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
