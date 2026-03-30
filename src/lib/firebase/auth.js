import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as _updateProfile,
  updateEmail as _updateEmail,
  updatePassword as _updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/clientApp";

export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

export async function signUpWithEmail(email, password) {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
}

export async function signInWithEmail(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
}

export async function updateUserProfile(displayName, photoURL) {
  try {
    await _updateProfile(auth.currentUser, { displayName, photoURL });
  } catch (error) {
    console.error("Error updating profile", error);
    throw error;
  }
}

export async function updateUserEmail(newEmail, currentPassword) {
  try {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await _updateEmail(auth.currentUser, newEmail);
  } catch (error) {
    console.error("Error updating email", error);
    throw error;
  }
}

export async function updateUserPassword(currentPassword, newPassword) {
  try {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await _updatePassword(auth.currentUser, newPassword);
  } catch (error) {
    console.error("Error updating password", error);
    throw error;
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}