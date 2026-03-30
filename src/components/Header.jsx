"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  signOut,
  onIdTokenChanged,
} from "@/src/lib/firebase/auth.js";
import { setCookie, deleteCookie } from "cookies-next";

function useUserSession(initialUser) {
  useEffect(() => {
    return onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        await setCookie("__session", idToken);
      } else {
        await deleteCookie("__session");
      }
      if (initialUser?.uid === user?.uid) {
        return;
      }
      window.location.reload();
    });
  }, [initialUser]);

  return initialUser;
}

export default function Header({ initialUser }) {
  const user = useUserSession(initialUser);

  const handleSignOut = (event) => {
    event.preventDefault();
    signOut();
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/Punt Watch Pro Logo.png" alt="FriendlyEats" />
        Punt Watch Pro
      </Link>
      {user ? (
        <>
          <div className="profile">
            <Link href="/profile">
              <img
                className="profileImage"
                src={user.photoURL ?? "/profile.svg"}
                alt={user.displayName || user.email}
                onError={(e) => { e.target.src = "/profile.svg"; }}
              />
              {user.displayName}
            </Link>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>
                <li>
                  <Link href="/profile">Edit Profile</Link>
                </li>
                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <Link href="/login">
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}
