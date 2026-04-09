"use client";

import { useState, useEffect } from "react";
import { getMarketplaceSnapshot, getUsersByUids } from "@/src/lib/firebase/firestore.js";

const SERVICE_LABELS = {
  instructional_content: "Instructional Content",
  rep_review: "Online Rep Review",
  virtual_lesson: "Virtual Lesson",
  private_lesson: "Private Lesson",
  subscription: "Monthly Subscription",
};

export default function MarketplacePage() {
  const [services, setServices] = useState([]);
  const [coachesMap, setCoachesMap] = useState({});

  useEffect(() => {
    return getMarketplaceSnapshot((data) => {
      setServices(data);
      const coachIds = [...new Set(data.map((s) => s.coachId).filter(Boolean))];
      if (coachIds.length) getUsersByUids(coachIds).then(setCoachesMap);
    });
  }, []);

  return (
    <main className="marketplace-page">
      <h1>Marketplace</h1>
      {services.length === 0 ? (
        <p className="marketplace-empty">No services listed yet.</p>
      ) : (
        <ul className="marketplace-list">
          {services.map((service) => {
            const coach = coachesMap[service.coachId];
            return (
              <li key={service.id} className="service-card">
                <div className="service-card__header">
                  <span className="service-card__type">{SERVICE_LABELS[service.type] ?? service.type}</span>
                  <span className="service-card__price">${service.price}</span>
                </div>
                <h2 className="service-card__title">{service.title}</h2>
                <p className="service-card__desc">{service.description}</p>
                <div className="service-card__coach">
                  <img
                    className="service-card__coach-pic"
                    src={coach?.photoURL ?? "/profile.svg"}
                    alt={coach?.displayName || "Coach"}
                    onError={(e) => { e.target.src = "/profile.svg"; }}
                  />
                  <span>{coach?.displayName || "Coach"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
