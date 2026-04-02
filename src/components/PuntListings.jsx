"use client";

// This components handles the punt listings page
// It receives data from src/app/page.jsx, such as the initial punts and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getPuntsSnapshot, getUsersByUids, getUsers } from "@/src/lib/firebase/firestore.js";
import PuntFilters from "@/src/components/PuntFilters.jsx";

const PuntItem = ({ punt, user, onUserClick }) => (
  <li key={punt.id}>
    <ActivePunt punt={punt} user={user} onUserClick={onUserClick} />
  </li>
);

const ActivePunt = ({ punt, user, onUserClick }) => (
  <div>
    <PuntVideo punt={punt} />
    <PuntDetails punt={punt} user={user} onUserClick={onUserClick} />
  </div>
);

const PuntVideo = ({ punt }) => (
    <div className ="punt-video">
        <video
         src={punt.videoURL}
         controls
         width="100%"
         />
    </div>
);

const PuntDetails = ({ punt, user, onUserClick }) => (
  <div className="punt__details">
    <h2>{punt.name}</h2>
    {user && (
      <button type="button" onClick={() => onUserClick(punt.uid, user.displayName)}>
        {user.displayName} — {user.position}, {user.team}
      </button>
    )}
    <PuntMetadata punt={punt} />
  </div>
);

const PuntMetadata = ({ punt }) => (
  <div className="punt__meta">
    <p>
      {punt.hangtime.toFixed(2)} seconds  {punt.distance} yards {new Date(punt.createdAt).toLocaleString()}
    </p>
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
  return (
    <article>
      <PuntFilters filters={filters} setFilters={setFilters} users={allUsers} />
      <ul className="punts">
        {punts.map((punt) => (
          <PuntItem key={punt.id} punt={punt} user={usersMap[punt.uid]} onUserClick={handleUserClick} />
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
