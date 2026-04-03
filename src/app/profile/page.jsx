"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/src/lib/firebase/clientApp";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getCurrentUser,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  onAuthStateChanged,
} from "@/src/lib/firebase/auth.js";
import { updateUserDoc } from "@/src/lib/firebase/firestore.js";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [profileMsg, setProfileMsg] = useState(null);
  const [emailMsg, setEmailMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return onAuthStateChanged((u) => {
      if (!u) {
        router.push("/punter");
        return;
      }
      setUser(u);
      setDisplayName(u.displayName || "");
      setEmail(u.email || "");
      setPhotoPreview(u.photoURL || null);
    });
  }, [router]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setUploading(true);
    try {
      let photoURL = user.photoURL;
      if (photoFile) {
        const storageRef = ref(storage, `profilePics/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await updateUserProfile(displayName, photoURL);
      await updateUserDoc(user.uid, { displayName, photoURL });
      setProfileMsg({ type: "success", text: "Profile updated." });
      setPhotoFile(null);
    } catch (err) {
      setProfileMsg({ type: "error", text: friendlyError(err.code) });
    } finally {
      setUploading(false);
    }
  };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    setEmailMsg(null);
    try {
      await updateUserEmail(email, currentPassword);
      setEmailMsg({ type: "success", text: "Email updated." });
      setCurrentPassword("");
    } catch (err) {
      setEmailMsg({ type: "error", text: friendlyError(err.code) });
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    try {
      await updateUserPassword(currentPassword, newPassword);
      setPasswordMsg({ type: "success", text: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: friendlyError(err.code) });
    }
  };

  if (!user) return null;

  return (
    <main className="profile-page">
      <h1>Profile</h1>

      {/* Profile Info */}
      <section className="profile-section">
        <h2>Profile Info</h2>
        <form onSubmit={handleProfileSave} className="profile-form">
          <div className="profile-pic-row">
            <img
              src={photoPreview || "/profile.svg"}
              alt="Profile"
              className="profileImage"
            />
            <button type="button" onClick={() => fileInputRef.current.click()}>
              Change Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </div>

          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          {profileMsg && (
            <p className={profileMsg.type === "error" ? "login-error" : "login-success"}>
              {profileMsg.text}
            </p>
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {/* Update Email */}
      <section className="profile-section">
        <h2>Update Email</h2>
        <form onSubmit={handleEmailSave} className="profile-form">
          <label htmlFor="email">New Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="currentPasswordEmail">Current Password</label>
          <input
            id="currentPasswordEmail"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Required to change email"
          />

          {emailMsg && (
            <p className={emailMsg.type === "error" ? "login-error" : "login-success"}>
              {emailMsg.text}
            </p>
          )}

          <button type="submit">Update Email</button>
        </form>
      </section>

      {/* Update Password */}
      <section className="profile-section">
        <h2>Update Password</h2>
        <form onSubmit={handlePasswordSave} className="profile-form">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {passwordMsg && (
            <p className={passwordMsg.type === "error" ? "login-error" : "login-success"}>
              {passwordMsg.text}
            </p>
          )}

          <button type="submit">Update Password</button>
        </form>
      </section>
    </main>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/wrong-password": return "Current password is incorrect.";
    case "auth/weak-password": return "New password must be at least 6 characters.";
    case "auth/email-already-in-use": return "That email is already in use.";
    case "auth/invalid-email": return "Invalid email address.";
    case "auth/requires-recent-login": return "Please sign out and sign back in before making this change.";
    case "auth/too-many-requests": return "Too many attempts. Try again later.";
    default: return "Something went wrong. Please try again.";
  }
}
