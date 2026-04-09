"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "@/src/lib/firebase/auth.js";
import { getUserDoc } from "@/src/lib/firebase/firestore.js";

export default function SideNav() {
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(async (u) => {
      if (!u) { setRole(null); setUid(null); return; }
      setUid(u.uid);
      const userDoc = await getUserDoc(u.uid);
      setRole(userDoc?.role || null);
    });
  }, []);

  const link = (href, label) => (
    <Link href={href} className={pathname === href ? "sidenav__link sidenav__link--active" : "sidenav__link"}>
      {label}
    </Link>
  );


  console.log("Rendering SideNav with role:", role, "and pathname:", pathname);
  return (
    <nav className="sidenav">
      {role === "coach" && link("/roster", "My Roster")}
      {/* {uid && link(`/reps?uid=${uid}`, "Reps")} */}
      {link("/profile", "Profile")}
      {link("/marketplace", "Marketplace")}
    </nav>
  );
}
