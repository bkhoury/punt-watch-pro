import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getRecentPunts } from "@/src/lib/firebase/firestore.js";
import RecentPunts from "@/src/components/RecentPunts.jsx";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { firebaseServerApp, currentUser } = await getAuthenticatedAppForUser();
  const db = getFirestore(firebaseServerApp);

  let uid = null;
  if (currentUser) {
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    if (snap.exists() && snap.data().role === "player") uid = currentUser.uid;
  }

  const punts = await getRecentPunts(db, 5, uid);

  return (
    <main className="main__home">
      <RecentPunts punts={punts} />
    </main>
  );
}
