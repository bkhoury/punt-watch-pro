// import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// import { getRestaurants } from "@/src/lib/firebase/firestore.js";
// import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// import { getFirestore } from "firebase/firestore";

// // Force next.js to treat this route as server-side rendered
// // Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

// export const dynamic = "force-dynamic";

// // This line also forces this route to be server-side rendered
// // export const revalidate = 0;

// export default async function Home(props) {
//   const searchParams = await props.searchParams;
//   // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
//   // ?city=London&category=Indian&sort=Review
//   const { firebaseServerApp } = await getAuthenticatedAppForUser();
//   const restaurants = await getRestaurants(
//     getFirestore(firebaseServerApp),
//     searchParams
//   );
//   return (
//     <main className="main__home">
//       <RestaurantListings
//         initialRestaurants={restaurants}
//         searchParams={searchParams}
//       />
//     </main>
//   );
// }

import Link from 'next/link';
import { lusitana } from '@/src/app/ui/fonts';
import Image from 'next/image';


export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <Image
          src="/Punt Watch Pro Logo.png"
          width={560}
          height={620}
          alt="Punt Watch Pro Logo"
        />
        <h1
          className={`${lusitana.className} ml-4 text-lg font-bold text-white md:text-4xl`}
        >
          Punt Watch Pro
        </h1>
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Log in</span>
          </Link>
      </div>
    </main>
  );
}
