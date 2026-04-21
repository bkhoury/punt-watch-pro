"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getPuntsSnapshot, getUsersByUids } from "@/src/lib/firebase/firestore.js";
import { PuntCard } from "@/src/components/PuntListings.jsx";

export default function RepsPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const [punts, setPunts] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    if (!uid) return;
    return getPuntsSnapshot((data) => {
      setPunts(data);
      const uids = [...new Set(data.map((p) => p.assignedUID).filter(Boolean))];
      getUsersByUids(uids).then(setUsersMap);
    }, { assignedUID: uid });
  }, [uid]);

  if (!uid) return <p>No user specified.</p>;

  return (
    <article>
      {punts.length === 0 ? (
        <p>No reps assigned to you yet.</p>
      ) : (
        <ul className="punts">
          {punts.map((punt) => (
            <PuntCard
              key={punt.id}
              punt={punt}
              user={usersMap[punt.assignedUID]}
              rosterUsers={[]}
              onUserClick={() => {}}
              onClaim={() => {}}
              onDelete={() => {}}
              onAssign={() => {}}
            />
          ))}
        </ul>
      )}
    </article>
  );
}
