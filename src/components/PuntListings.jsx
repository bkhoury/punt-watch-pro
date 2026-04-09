"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPuntsSnapshot, getUsersByUids, claimPunt, deletePunt, getUserDoc, getRoster } from "@/src/lib/firebase/firestore.js";
import { getCurrentUser, onAuthStateChanged } from "@/src/lib/firebase/auth.js";
import PuntFilters from "@/src/components/PuntFilters.jsx";
import PuntComments from "@/src/components/PuntComments.jsx";

// --- Sub-components ---

const PuntVideo = ({ punt }) => (
  <div className="punt-video">
    <video src={punt.videoURL} controls />
  </div>
);


export const PuntCard = ({ punt, user, rosterUsers, onUserClick, onClaim, onDelete, onAssign }) => (
  <li className="punt-card">
    <PuntVideo punt={punt} />
    <div className="punt__details">
      <div className="punt__details-top">
        <div className="punt__punter-row">
          <img
            className="punt__punter-pic"
            src={user?.photoURL ?? "/profile.svg"}
            alt={user?.displayName || "Unknown"}
            onError={(e) => { e.target.src = "/profile.svg"; }}
          />
          {user ? (
            <button type="button" className="punt__punter" onClick={() => onUserClick(punt.uid, user.displayName)}>
              {user.displayName}
              <span>{user.position} · {user.team}</span>
            </button>
          ) : (
            <span className="punt__punter-unknown">Unclaimed</span>
          )}
        </div>
        <div className="punt__details-right">
          <h2 className="punt__name">{punt.name}</h2>
          <span className="punt__stat-value" suppressHydrationWarning>{new Date(punt.createdAt).toLocaleString([], { month: "numeric", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          <button type="button" className="punt__delete" onClick={() => onDelete(punt.id, punt.videoURL)}>Delete</button>
          <button type="button" className="punt__claim" onClick={() => onClaim(punt.id)}>Claim</button>
        </div>
      </div>
      {rosterUsers?.length > 0 && (
        <div className="punt__assign-row">
          <select
            className="punt__assign-select"
            value={punt.uid || ""}
            onChange={(e) => onAssign(punt.id, e.target.value)}
          >
            <option value="">— Assign to player —</option>
            {rosterUsers.map((p) => (
              <option key={p.uid} value={p.uid}>{p.displayName || p.email}</option>
            ))}
          </select>
        </div>
      )}
    </div>
    <PuntComments puntId={punt.id} />
  </li>
);

const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <h2>Delete Punt?</h2>
      <p>This will permanently delete the rep and its video. This cannot be undone.</p>
      <div className="modal-actions">
        <button className="button--cancel" onClick={onCancel}>Cancel</button>
        <button className="button--confirm modal-confirm--delete" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

// --- Main component ---

export default function PuntListings({ searchParams }) {
  console.log("PuntListings searchParams:", searchParams);
  const router = useRouter();

  const [punts, setPunts] = useState([]);
  const [filters, setFilters] = useState({
    hangtime: searchParams?.hangtime || "",
    distance: searchParams?.distance || "",
    sort: searchParams?.sort || "",
    uid: searchParams?.uid || "",
    userName: searchParams?.userName || "",
  });
  const [usersMap, setUsersMap] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [roleFilters, setRoleFilters] = useState(null);
  const [roleReady, setRoleReady] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Resolve role-based query filters once auth state is known
  useEffect(() => {
    return onAuthStateChanged(async (u) => {
      if (!u) {
        setRoleReady(true);
        return;
      }
      const userDoc = await getUserDoc(u.uid);
      if (userDoc?.role === "player") {
        setRoleFilters({ uid: u.uid });
      } else if (userDoc?.role === "coach") {
        const rosterUids = await getRoster(u.uid);
        setRoleFilters(rosterUids.length ? { allowedUids: rosterUids } : { allowedUids: ["__empty__"] });
        console.log("Coach roster UIDs:", rosterUids);
        getUsersByUids(rosterUids).then((map) => setAllUsers(Object.values(map)));
      } else {
        setRoleFilters({ allowedUids: ["__empty__"] });
      }
      setRoleReady(true);
    });
  }, []);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.append(key, value);
    }
    router.push(`?${params.toString()}`);
  }, [router, filters]);

  // Subscribe to punts once role is ready
  useEffect(() => {
    if (!roleReady || roleFilters === null) return;
    return getPuntsSnapshot((data) => {
      const minHangtime = filters.hangtime ? parseInt(filters.hangtime) : null;
      const minDistance = filters.distance ? parseInt(filters.distance) : null;
      const filtered = data.filter((punt) => {
        if (minHangtime !== null && punt.hangtime < minHangtime) return false;
        if (minDistance !== null && punt.distance < minDistance) return false;
        return true;
      });
      setPunts(filtered);
      const uids = [...new Set(filtered.map((p) => p.uid).filter(Boolean))];
      getUsersByUids(uids).then(setUsersMap);
    }, { ...roleFilters, ...filters });
  }, [filters, roleFilters, roleReady]);

  const handleUserClick = (uid, userName) => {
    setFilters((prev) => ({ ...prev, uid, userName }));
  };

  const handleClaim = (puntId) => {
    const currentUser = getCurrentUser();
    if (currentUser) claimPunt(puntId, currentUser.uid);
  };

  const handleAssign = (puntId, uid) => {
    if (uid) claimPunt(puntId, uid);
  };

  const handleConfirmDelete = () => {
    deletePunt(confirmDelete.id, confirmDelete.videoURL);
    setConfirmDelete(null);
  };

  return (
    <article>
      <ul className="punts">
        {punts.map((punt) => (
          <PuntCard
            key={punt.id}
            punt={punt}
            user={usersMap[punt.uid]}
            rosterUsers={allUsers}
            onUserClick={handleUserClick}
            onClaim={handleClaim}
            onDelete={(id, videoURL) => setConfirmDelete({ id, videoURL })}
            onAssign={handleAssign}
          />
        ))}
      </ul>
      {confirmDelete && (
        <DeleteModal onConfirm={handleConfirmDelete} onCancel={() => setConfirmDelete(null)} />
      )}
    </article>
  );
}
