import "@/src/app/styles.css";
import Header from "@/src/components/Header.jsx";
import SideNav from "@/src/components/SideNav.jsx";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Punt Watch Pro",
  description:
    "Punt Watch Pro is a punt video platformwith Next.js and Firebase.",
};

export default async function RootLayout({ children }) {
  const { currentUser } = await getAuthenticatedAppForUser();

  return (
    <html lang="en">
      <body>
        <Header initialUser={currentUser?.toJSON()} />
        <div className="layout">
          <SideNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
