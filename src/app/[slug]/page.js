'use client';

import { useEffect, useState } from "react";
import LandingPage from "../LandingPage/LandingPage";
import { notFound } from "next/navigation";

// Fetch admin by slug from domain
async function getAdmin(slug) {
  const res = await fetch(
    `https://appo.coinagesoft.com/api/public-landing/slug?slug=${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const data = await res.json();
  if (!data.admin) notFound();

  return data.admin;
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    setHydrated(true);

    async function loadAdmin() {
      try {
        const hostname = window.location.hostname;
        const data = await getAdmin(hostname);
        setAdmin(data);
      } catch (err) {
        console.error(err);
        notFound();
      }
    }

    loadAdmin();
  }, []);

  // Wait until hydration and admin are ready
  if (!hydrated || !admin) return null;

  return <LandingPage admin={admin} />;
}
