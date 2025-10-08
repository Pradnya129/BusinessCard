'use client';

import { useEffect, useState } from "react";
import LandingPage from "./LandingPage/LandingPage";
import { notFound } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";

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
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const hostname = window.location.hostname;
        const data = await getAdmin(hostname);
        setAdmin(data);
      } catch (err) {
        console.error(err);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, []);

  // ✅ Show loader while loading OR no admin yet
  if (loading || !admin) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <ClipLoader size={60} color="#2563EB" />
      </div>
    );
  }

  return <LandingPage admin={admin} />;
}
