"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "@/src/lib/firebase/auth.js";
import { getUserDoc, getRoster, getUsersByUids } from "@/src/lib/firebase/firestore.js";

export default function RosterPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(async (u) => {
      if (!u) { router.push("/login"); return; }
      const userDoc = await getUserDoc(u.uid);
      if (userDoc?.role !== "coach") { router.push("/punter"); return; }
      const rosterUids = await getRoster(u.uid);
      if (rosterUids.length) {
        const usersMap = await getUsersByUids(rosterUids);
        setPlayers(Object.values(usersMap));
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return null;

  return (
    <main className="roster-page">
      <h1>My Roster</h1>
      {players.length === 0 ? (
        <p className="roster-empty">No players on your roster yet. Share your invite code on your profile page.</p>
      ) : (
        <ul className="roster-list">
          {players.map((player) => (
            <li key={player.uid}>
              <Link href={`/reps?uid=${player.uid}`} className="roster-card">
                <img
                  className="roster-card__pic"
                  src={player.photoURL || "/profile.svg"}
                  alt={player.displayName || player.email}
                  onError={(e) => { e.target.src = "/profile.svg"; }}
                />
                <div className="roster-card__info">
                  <span className="roster-card__name">{player.displayName || "—"}</span>
                  <span className="roster-card__email">{player.email}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
