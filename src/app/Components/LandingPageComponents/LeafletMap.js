import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeafletMap = () => {
  const [iframeUrl, setIframeUrl] = useState('');

useEffect(() => {
  const fetchIframeUrl = async () => {
    try {
      // ✅ Get slug from hostname (production)
     const hostname = window.location.hostname; // "www.appointify.me" or "www.aura-enterprises.in"
const pathname = window.location.pathname; // "/aura-enterprises" or "/"

// Determine slug
let slug = "";

// If main domain
if (hostname.includes("www.appointify.me") || hostname.includes("localhost") ) {
  slug = pathname.split("/")[1]; // get slug from URL path
  console.log("slug/",slug)
} else {
  // Custom domain → send hostname as slug
  slug = hostname;
}

    

      if (!slug) throw new Error("Slug not found in hostname or URL path");

      // ✅ Fetch iframe URL using slug query param
      const res = await axios.get(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
      console.log("res iframeurl", res.data.data.locationIframeURL);

      if (res.data.data?.locationIframeURL) {
        setIframeUrl(res.data.data.locationIframeURL);
      } else {
        console.warn("No iframe URL found in response");
      }
    } catch (err) {
      console.error("Error loading map:", err);
    }
  };

  fetchIframeUrl();
}, []);


  if (!iframeUrl) return null;

  return (
    <section className="container my-5 py-5">
      <div className="text-center mb-4">
        <h2 className="fw-bold">Find Us on the Map</h2>
        <p className="text-muted">We’re located at the heart of the city</p>
      </div>

      <div className="ratio ratio-16x9 rounded shadow overflow-hidden">
        <iframe
          src={iframeUrl}
          title="Google Map"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
      </div>
      
    </section>
  );
};

export default LeafletMap;
