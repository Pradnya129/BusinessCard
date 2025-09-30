"use client";

import { use, useEffect, useState } from "react";
import LandingPage from "./LandingPage/LandingPage";
import { notFound } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";

// Fetch admin data
async function getAdmin(slug) {
  const res = await fetch(
    `https://appo.coinagesoft.com/api/admin/slug?slug=${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const data = await res.json();
  if (!data.admin) notFound();

  return data.admin;
}

export default function Home({ params }) {
  // ✅ unwrap params
  const { slug } = use(params);

  const [hydrated, setHydrated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHydrated(true);

    async function loadAdmin() {
      try {
        const data = await getAdmin(slug);
        setAdmin(data);
      } catch (err) {
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, [slug]);

  // Full-page loader until hydration + API fetch complete
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

  // Optional: add fade-in for the page
  return (
    <div className="transition-opacity duration-500 opacity-100">
      <LandingPage admin={admin} />
    </div>
  );
}
