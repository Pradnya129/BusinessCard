"use client";

import { useEffect, useState } from "react";
import LandingPage from "../LandingPage/LandingPage";
import { notFound } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";

// Fetch admin by slug from domain
async function getAdmin(slug) {
  const res = await fetch(
    `https://appo.coinagesoft.com/api/admin/slug?slug=${slug}`, // send hostname as query
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHydrated(true);

    async function loadAdmin() {
      try {
        // Get hostname from browser
        const hostname = window.location.hostname; // e.g., booking.vedratnavastu.com
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

  if (!hydrated || loading) {
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

  if (!admin) return null;

  return <LandingPage admin={admin} />;
}
