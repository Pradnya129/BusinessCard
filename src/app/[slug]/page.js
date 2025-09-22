import LandingPage from "../LandingPage/LandingPage.js";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Home({ params }) {
  const { slug } = params; // get slug from URL

  // Fetch admin from backend
  const res = await fetch(`https://appo.coinagesoft.com/api/admin/slug?slug=${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    // Use Next.js 404 handling
    notFound();
  }

  const data = await res.json();

  if (!data.admin) {
    notFound();
  }

  // Pass admin to LandingPage
  return (
    <div>
      <LandingPage admin={data.admin} />
    </div>
  );
}
