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
import { updateUserDoc, getUserDoc, generateInviteCode, getInviteCode, redeemInviteCode, upsertService, deleteService, getServicesForCoach } from "@/src/lib/firebase/firestore.js";

const SERVICE_LABELS = {
  instructional_content: "Instructional Content",
  rep_review: "Online Rep Review",
  virtual_lesson: "Virtual Lesson",
  private_lesson: "Private Lesson",
  subscription: "Monthly Subscription",
  group_session: "Group Session",
};

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
  const [userDoc, setUserDoc] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteMsg, setInviteMsg] = useState(null);
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [customCodeMsg, setCustomCodeMsg] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({ type: "rep_review", title: "", description: "", price: "" });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceMsg, setServiceMsg] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(async (u) => {
      if (!u) {
        return;
      }
      setUser(u);
      setDisplayName(u.displayName || "");
      setEmail(u.email || "");
      setPhotoPreview(u.photoURL || null);
      const doc = await getUserDoc(u.uid);
      setUserDoc(doc);
      if (doc?.role === "coach") {
        const code = await getInviteCode(u.uid);
        setInviteCode(code);
        const coachServices = await getServicesForCoach(u.uid);
        setServices(coachServices);
      }
    });
  }, [router]);

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setCustomCodeMsg(null);
    try {
      const code = await generateInviteCode(user.uid, customCodeInput.trim() || null);
      setInviteCode(code);
      setCustomCodeInput("");
      setCustomCodeMsg({ type: "success", text: "Code saved." });
    } catch (err) {
      setCustomCodeMsg({ type: "error", text: err.message });
    }
  };

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    setInviteMsg(null);
    try {
      await redeemInviteCode(inviteInput.trim().toUpperCase(), user.uid);
      setInviteMsg({ type: "success", text: "You've joined the team!" });
      setInviteInput("");
    } catch (err) {
      setInviteMsg({ type: "error", text: err.message });
    }
  };

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
      await updateUserDoc(user.uid, { email });
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

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceMsg(null);
    try {
      const id = await upsertService(user.uid, editingServiceId, {
        ...serviceForm,
        price: parseFloat(serviceForm.price),
      });
      const updated = editingServiceId
        ? services.map((s) => s.id === editingServiceId ? { ...s, ...serviceForm, id } : s)
        : [...services, { ...serviceForm, id, coachId: user.uid }];
      setServices(updated);
      setServiceForm({ type: "rep_review", title: "", description: "", price: "" });
      setEditingServiceId(null);
      setServiceMsg({ type: "success", text: editingServiceId ? "Service updated." : "Service added." });
    } catch (err) {
      setServiceMsg({ type: "error", text: "Failed to save service." });
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({ type: service.type, title: service.title, description: service.description, price: String(service.price) });
    setServiceMsg(null);
  };

  const handleDeleteService = async (serviceId) => {
    await deleteService(serviceId);
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
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

      {/* No role set — let user pick */}
      {userDoc && !userDoc.role && (
        <section className="profile-section">
          <h2>Set Your Role</h2>
          <p className="invite-desc">Select your role to unlock the full experience.</p>
          <div className="role-picker__options">
            <button
              type="button"
              className="role-option"
              onClick={async () => {
                await updateUserDoc(user.uid, { role: "player" });
                setUserDoc((prev) => ({ ...prev, role: "player" }));
              }}
            >
              <span className="role-option__title">Player</span>
              <span className="role-option__desc">Upload and manage your own reps</span>
            </button>
            <button
              type="button"
              className="role-option"
              onClick={async () => {
                await updateUserDoc(user.uid, { role: "coach" });
                setUserDoc((prev) => ({ ...prev, role: "coach" }));
              }}
            >
              <span className="role-option__title">Coach</span>
              <span className="role-option__desc">View and manage a roster of players</span>
            </button>
          </div>
        </section>
      )}

      {/* Coach — Invite Code */}
      {userDoc?.role === "coach" && (
        <section className="profile-section">
          <h2>Invite Code</h2>
          <p className="invite-desc">Share this code with players so they can join your roster.</p>
          {inviteCode && (
            <div className="invite-code-display" style={{ marginBottom: "20px" }}>
              <span className="invite-code">{inviteCode}</span>
            </div>
          )}
          <form onSubmit={handleGenerateCode} className="profile-form">
            <label htmlFor="customCode">{inviteCode ? "Change Code" : "Choose a Code"}</label>
            <input
              id="customCode"
              type="text"
              value={customCodeInput}
              onChange={(e) => setCustomCodeInput(e.target.value.toUpperCase())}
              placeholder="Leave blank to generate randomly"
              maxLength={12}
              style={{ textTransform: "uppercase" }}
            />
            {customCodeMsg && (
              <p className={customCodeMsg.type === "error" ? "login-error" : "login-success"}>
                {customCodeMsg.text}
              </p>
            )}
            <button type="submit">{inviteCode ? "Update Code" : "Generate Code"}</button>
          </form>
        </section>
      )}

      {/* Coach — Marketplace Services */}
      {userDoc?.role === "coach" && (
        <section className="profile-section">
          <h2>My Services</h2>
          <p className="invite-desc">List services for players to purchase on the marketplace.</p>

          {/* Existing services */}
          {services.length > 0 && (
            <ul className="services-list">
              {services.map((s) => (
                <li key={s.id} className="service-item">
                  <div className="service-item__info">
                    <span className="service-card__type">{SERVICE_LABELS[s.type] ?? s.type}</span>
                    <strong>{s.title}</strong>
                    <span>${s.price}</span>
                  </div>
                  <div className="service-item__actions">
                    <button type="button" onClick={() => handleEditService(s)}>Edit</button>
                    <button type="button" onClick={() => handleDeleteService(s.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Add / Edit form */}
          <form onSubmit={handleServiceSubmit} className="profile-form">
            <h3>{editingServiceId ? "Edit Service" : "Add Service"}</h3>

            <label htmlFor="serviceType">Type</label>
            <select
              id="serviceType"
              value={serviceForm.type}
              onChange={(e) => setServiceForm((p) => ({ ...p, type: e.target.value }))}
            >
              {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <label htmlFor="serviceTitle">Title</label>
            <input
              id="serviceTitle"
              type="text"
              value={serviceForm.title}
              onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))}
              required
            />

            <label htmlFor="serviceDesc">Description</label>
            <textarea
              id="serviceDesc"
              value={serviceForm.description}
              onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
            />

            <label htmlFor="servicePrice">Price ($)</label>
            <input
              id="servicePrice"
              type="number"
              min="0"
              step="0.01"
              value={serviceForm.price}
              onChange={(e) => setServiceForm((p) => ({ ...p, price: e.target.value }))}
              required
            />

            {serviceMsg && (
              <p className={serviceMsg.type === "error" ? "login-error" : "login-success"}>
                {serviceMsg.text}
              </p>
            )}

            <div className="service-form__actions">
              <button type="submit">{editingServiceId ? "Update Service" : "Add Service"}</button>
              {editingServiceId && (
                <button type="button" onClick={() => { setEditingServiceId(null); setServiceForm({ type: "rep_review", title: "", description: "", price: "" }); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* Player — Join a Team */}
      {userDoc?.role === "player" && (
        <section className="profile-section">
          <h2>Join a Team</h2>
          <p className="invite-desc">Enter an invite code from your coach to join their roster.</p>
          <form onSubmit={handleRedeemCode} className="profile-form">
            <label htmlFor="inviteCode">Invite Code</label>
            <input
              id="inviteCode"
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="e.g. A1B2C3"
              maxLength={16}
              style={{ textTransform: "uppercase" }}
            />
            {inviteMsg && (
              <p className={inviteMsg.type === "error" ? "login-error" : "login-success"}>
                {inviteMsg.text}
              </p>
            )}
            <button type="submit" disabled={!inviteInput.trim()}>Join Team</button>
          </form>
        </section>
      )}

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
