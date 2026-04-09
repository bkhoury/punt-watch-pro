"use client";

import { useState, useEffect } from "react";
import { getUsersByUids } from "@/src/lib/firebase/firestore.js";
import { PuntCard } from "@/src/components/PuntListings.jsx";

export default function RecentPunts({ punts }) {
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    const uids = [...new Set(punts.map((p) => p.uid).filter(Boolean))];
    if (uids.length) getUsersByUids(uids).then(setUsersMap);
  }, [punts]);

  return (
    <section className="recent-punts">
      <ul className="punts">
        {punts.map((punt) => (
          <PuntCard
            key={punt.id}
            punt={punt}
            user={usersMap[punt.uid]}
          />
        ))}
      </ul>
    </section>
  );
}
