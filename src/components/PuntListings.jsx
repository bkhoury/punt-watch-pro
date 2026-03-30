"use client";

// This components handles the punt listings page
// It receives data from src/app/page.jsx, such as the initial punts and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getPuntsSnapshot } from "@/src/lib/firebase/firestore.js";
import PuntFilters from "@/src/components/PuntFilters.jsx";

const PuntItem = ({ punt }) => (
  <li key={punt.id}>
      <ActivePunt punt={punt} />
  </li>
);

const ActivePunt = ({ punt }) => (
  <div>
    {/* <ImageCover photo={"Punt Watch Pro Logo.png"} name={punt.name} /> */}
    <PuntVideo punt={punt} />
    <PuntDetails punt={punt} />
  </div>
);

const PuntVideo = ({ punt }) => (
    <div className ="punt-video">
        <video 
         src={punt.videoURL}
         controls
         width="100%"
         />
    </div> 
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const PuntDetails = ({ punt }) => (
  <div className="punt__details">
    <h2>{punt.name}</h2>
    <PuntMetadata punt={punt} />
  </div>
);

const PuntMetadata = ({ punt }) => (
  <div className="punt__meta">
    <p>
      {punt.hangtime.toFixed(2)} seconds  {punt.distance} yards {new Date(punt.createdAt).toLocaleString()}
    </p>
  </div>
);

export default function PuntListings({
  initialPunts,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    hangtime: searchParams?.hangtime || "",
    distance: searchParams?.distance || "",
    sort: searchParams?.sort || "",
  };

  const [punts, setPunts] = useState(initialPunts);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getPuntsSnapshot((data) => {
      const minHangtime = filters.hangtime ? parseInt(filters.hangtime) : null;
      const minDistance = filters.distance ? parseInt(filters.distance) : null;
      const filtered = data.filter((punt) => {
        if (minHangtime !== null && punt.hangtime < minHangtime) return false;
        if (minDistance !== null && punt.distance < minDistance) return false;
        return true;
      });
      setPunts(filtered);
    }, filters)
  }, [filters]);
  return (
    <article>
      <PuntFilters filters={filters} setFilters={setFilters} />
      <ul className="punts">
        {punts.map((punt) => (
          <PuntItem key={punt.id} punt={punt} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
