import {
  collection,
  onSnapshot,
  query,
  getDocs,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  Timestamp,
  where,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { db, storage, auth } from "@/src/lib/firebase/clientApp";


function applyPuntQueryFilters(q, filters = {}) {
  console.log("Applying punt query filters:", filters);
  if (filters.uid) {
    q = query(q, where("uid", "==", filters.uid));
  } else if (filters.allowedUids?.length) {
    q = query(q, where("uid", "in", filters.allowedUids.slice(0, 30)));
  }
  // if (filters.uid == "") {
  //   q = query(q, where("uid", "==", "__no_match__"));
  // }
  q = query(q, orderBy("createdAt", "desc"));
  return q;
}

export async function getUsers() {
  console.log("Fetching all users");
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
    if (snap.exists()) map[snap.id] = { uid: snap.id, ...snap.data() };
  });
  return map;
}

export async function updateUserDoc(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function generateInviteCode(coachId, customCode = null) {
  const code = customCode
    ? customCode.toUpperCase()
    : Math.random().toString(36).substring(2, 8).toUpperCase();
  const existing = await getDoc(doc(db, "inviteCodes", code));
  if (existing.exists() && existing.data().coachId !== coachId) {
    throw new Error("That code is already taken. Please choose another.");
  }
  await setDoc(doc(db, "inviteCodes", code), { coachId, createdAt: Timestamp.now() });
  await updateUserDoc(coachId, { inviteCode: code });
  return code;
}

export async function getInviteCode(coachId) {
  const snap = await getDoc(doc(db, "users", coachId));
  return snap.exists() ? snap.data().inviteCode || null : null;
}

export async function redeemInviteCode(code, playerId) {
  const codeSnap = await getDoc(doc(db, "inviteCodes", code));
  if (!codeSnap.exists()) throw new Error("Invalid invite code.");
  const { coachId } = codeSnap.data();
  if (coachId === playerId) throw new Error("You cannot join your own roster.");
  await setDoc(doc(db, "users", coachId, "roster", playerId), { joinedAt: Timestamp.now() });
}

export async function getRoster(coachId) {
  const snap = await getDocs(collection(db, "users", coachId, "roster"));
  return snap.docs.map((d) => d.id);
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
  console.log("getPuntsSnapshot called with filters:");
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }
  console.log("Setting up punts snapshot with filters:", filters);
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

export async function getRecentPunts(dbInstance, count = 5, uid = null) {
  let q = query(collection(dbInstance, "reps"), orderBy("createdAt", "desc"), limit(count));
  if (uid) q = query(collection(dbInstance, "reps"), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: data.createdAt?.toMillis() ?? null };
  });
}

// --- Marketplace ---

export async function upsertService(coachId, serviceId, data) {
  const ref = serviceId
    ? doc(db, "services", serviceId)
    : doc(collection(db, "services"));
  await setDoc(ref, { ...data, coachId, updatedAt: Timestamp.now() }, { merge: true });
  return ref.id;
}

export async function deleteService(serviceId) {
  await deleteDoc(doc(db, "services", serviceId));
}

export async function getServicesForCoach(coachId) {
  const q = query(collection(db, "services"), where("coachId", "==", coachId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function getMarketplaceSnapshot(cb) {
  const q = query(collection(db, "services"), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
