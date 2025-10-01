"use client";

import { useEffect, useState } from "react";
import LandingPage from "../LandingPage/LandingPage";
import { notFound } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";

// Fetch admin without slug
async function getAdmin() {
  const res = await fetch(
    `https://appo.coinagesoft.com/api/admin/slug`, // keep your fixed API endpoint
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
        const data = await getAdmin();
        setAdmin(data);
      } catch (err) {
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
