import Restaurant from "@/src/components/Restaurant.jsx";
import { Suspense } from "react";
import { getRestaurantById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import PuntListings from "@/src/components/PuntListings.jsx";
import { getFirestore } from "firebase/firestore";
import { getPunts, getRestaurants } from "@/src/lib/firebase/firestore.js";

export default async function Home(props) {
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?city=London&category=Indian&sort=Review
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp),
    searchParams
  );
  console.log("InitialRestaurants", restaurants);
  const punts = await getPunts(
    getFirestore(firebaseServerApp),
    searchParams
  );
  console.log("InitialPunts", punts);
  return (
    <main className="main__home">
      <PuntListings
        initialPunts={punts}
        searchParams={searchParams}
      />
    </main>
  );
}