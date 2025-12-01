'use client';
import { useEffect, useState } from "react";
import LandingPage from "../LandingPage/LandingPage";
import { notFound } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";

async function getAdmin(slug) {
  console.log("slug",slug)
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
  const [hydrated, setHydrated] = useState(false);

  // Fix hydration mismatch by forcing client render after hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const hostname = window.location.hostname;
        const adminData = await getAdmin(hostname);
        setAdmin(adminData);
      } catch (err) {
        console.error("Error fetching admin:", err);
      }
    }
    fetchAdmin();
  }, []);

  useEffect(() => {
    if (!admin) return;

    const handleFullReady = async () => {
      await new Promise((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", resolve, { once: true });
      });

      const images = Array.from(document.images);
      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.addEventListener("load", resolve);
                img.addEventListener("error", resolve);
              }
            })
        )
      );

      await new Promise((r) => setTimeout(r, 400));
      setLoading(false);
    };

    handleFullReady();
  }, [admin]);

  if (!hydrated) return null; // prevents early flash before hydration

  return (
    <>
      {/* Loader Overlay */}
      <div
        style={{
          opacity: loading ? 1 : 0,
          visibility: loading ? "visible" : "hidden",
          transition: "opacity 0.6s ease, visibility 0.6s ease",
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

      {/* Render only when hydrated + admin loaded */}
      {admin && (
        <div
          style={{
            opacity: loading ? 0 : 1,
            visibility: loading ? "hidden" : "visible",
            transition: "opacity 0.8s ease",
          }}
        >
          <LandingPage admin={admin} />
        </div>
      )}
    </>
  );
}
