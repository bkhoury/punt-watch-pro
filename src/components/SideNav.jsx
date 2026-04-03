"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="sidenav">
      <Link href="/profile" className={pathname === "/profile" ? "sidenav__link sidenav__link--active" : "sidenav__link"}>
        Profile
      </Link>
    </nav>
  );
}
