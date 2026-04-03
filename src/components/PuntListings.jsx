"use client";

// This components handles the punt listings page
// It receives data from src/app/page.jsx, such as the initial punts and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getPuntsSnapshot, getUsersByUids, getUsers, claimPunt } from "@/src/lib/firebase/firestore.js";
import { getCurrentUser } from "@/src/lib/firebase/auth.js";
import PuntFilters from "@/src/components/PuntFilters.jsx";

const PuntItem = ({ punt, user, onUserClick, onClaim }) => (
  <li className="punt-card">
    <PuntVideo punt={punt} />
    <PuntDetails punt={punt} user={user} onUserClick={onUserClick} onClaim={onClaim} />
  </li>
);

const PuntVideo = ({ punt }) => (
  <div className="punt-video">
    <video src={punt.videoURL} controls />
  </div>
);

const PuntDetails = ({ punt, user, onUserClick, onClaim }) => (
  <div className="punt__details">
    <div className="punt__details-top">
      <div className="punt__punter-row">
        <img
          className="punt__punter-pic"
          src={user?.photoURL || "/profile.svg"}
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
        <button type="button" className="punt__claim" onClick={() => onClaim(punt.id)}>
          Claim
        </button>
      </div>
    </div>
    <div className="punt__stats">
      <div className="punt__stat">
        <span className="punt__stat-value">{punt.hangtime.toFixed(2)}s</span>
        <span className="punt__stat-label">Hangtime</span>
      </div>
      <div className="punt__stat">
        <span className="punt__stat-value">{punt.distance} yd</span>
        <span className="punt__stat-label">Distance</span>
      </div>
      <div className="punt__stat punt__stat--date">
        <span className="punt__stat-value">{new Date(punt.createdAt).toLocaleDateString()}</span>
        <span className="punt__stat-label">{new Date(punt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>
    </div>
  </div>
);

export default function PuntListings({
  initialPunts,
  searchParams,
}) {
  const router = useRouter();

  const initialFilters = {
    hangtime: searchParams?.hangtime || "",
    distance: searchParams?.distance || "",
    sort: searchParams?.sort || "",
    uid: searchParams?.uid || "",
    userName: searchParams?.userName || "",
  };

  const [punts, setPunts] = useState(initialPunts);
  const [filters, setFilters] = useState(initialFilters);
  const [usersMap, setUsersMap] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setAllUsers);
  }, []);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
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
    }, filters)
  }, [filters]);

  const handleUserClick = (uid, userName) => {
    setFilters((prev) => ({ ...prev, uid, userName }));
  };

  const handleClaim = (puntId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    claimPunt(puntId, currentUser.uid);
  };

  return (
    <article>
      <PuntFilters filters={filters} setFilters={setFilters} users={allUsers} />
      <ul className="punts">
        {punts.map((punt) => (
          <PuntItem key={punt.id} punt={punt} user={usersMap[punt.uid]} onUserClick={handleUserClick} onClaim={handleClaim} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
