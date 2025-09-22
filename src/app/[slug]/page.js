import LandingPage from "../LandingPage/LandingPage.js";

export default async function Home({ params }) {
  const { slug } = params; // get slug from URL

  // Fetch admin from backend
  const res = await fetch(`https://appo.coinagesoft.com/api/admin/slug?slug=${slug}`, {
    cache: 'no-store',
  });

  // If backend returns 404 or error, show not found
  if (!res.ok) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-6">Landing Page Not Found</p>
        <p className="mb-6">We couldn’t find the landing page for "{slug}"</p>
        <a 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    );
  }

  const data = await res.json();

  if (!data.admin) {
    return (
     < div className="container ">
         <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl mb-6">Landing Page Not Found</p>
        <p className="mb-6">We couldn’t find the landing page for "{slug}"</p>
        <a 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
     </div>
    );
  }

  // Pass admin to LandingPage
  return (
    <div>
      <LandingPage admin={data.admin} />
    </div>
  );
}
