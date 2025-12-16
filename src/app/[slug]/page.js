'use client';
import { useEffect, useState } from "react";
import LandingPage from "../LandingPage/LandingPage";
import { notFound } from "next/navigation";
import ThreeDotsLoader from "../Components/LandingPageComponents/ThreeDotsLoader.js";

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
  const [plansReady, setPlansReady] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        let slug = "";

        if (hostname.includes("appointify.me") || hostname.includes("localhost")) {
          slug = pathname.split("/")[1];
        } else {
          slug = hostname; // custom domain
        }

        const adminData = await getAdmin(slug);
        setAdmin(adminData);
      } catch (err) {
        console.error("Error fetching admin:", err);
      }
    }
    fetchAdmin();
  }, []);

  useEffect(() => {
    if (admin) {
      setLoading(false);
    }
  }, [admin]);

  // Trigger smooth fade-in when plans are ready
  useEffect(() => {
    if (plansReady) {
      const timer = setTimeout(() => setShowContent(true), 50); // slight delay ensures transition
      return () => clearTimeout(timer);
    }
  }, [plansReady]);

  return (
    <>
      {/* FULL SCREEN LOADER — stays until BOTH admin + plans are ready */}
      {(loading || !plansReady) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <ThreeDotsLoader />
        </div>
      )}

      {/* PAGE CONTENT WITH SMOOTH FADE-IN */}
      {admin && (
        <div
          style={{
            opacity: showContent ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          <LandingPage
            admin={admin}
            onPlansReady={() => setPlansReady(true)}
          />
        </div>
      )}
    </>
  );
}
