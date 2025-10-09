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
    // ✅ Step 1: Fetch admin data
    async function fetchAdmin() {
      try {
        const hostname = window.location.hostname;

        const adminData = await getAdmin(hostname); // 
        setAdmin(adminData);
      } catch (err) {
        console.error("Error fetching admin:", err);
      }
    }

    fetchAdmin();
  }, []);

  // ✅ Step 2: Wait for entire LandingPage (including images + APIs)
  useEffect(() => {
    if (!admin) return;

    const handlePageLoad = async () => {
      // Wait till window fully loaded (CSS, images, fonts)
      await new Promise((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", resolve, { once: true });
      });

      // Small delay for smoother transition
      await new Promise((r) => setTimeout(r, 400));

      setLoading(false);
    };

    handlePageLoad();
  }, [admin]);

  return (
    <>
      {/* 🔄 Loader */}
      {loading && (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 9999,
          }}
        >
          <ClipLoader size={60} color="#2563EB" />
        </div>
      )}

      {/* 🌐 LandingPage Preloads in Background */}
      <div
        style={{
          opacity: loading ? 0 : 1,
          visibility: loading ? "hidden" : "visible",
          transition: "opacity 0.6s ease",
        }}
      >
        {admin && <LandingPage admin={admin} />}
      </div>
    </>
  );
}
