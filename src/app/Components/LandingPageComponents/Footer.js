'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const Footer = () => {
  const [plans, setPlans] = useState([]);
  const [slug, setSlug] = useState(''); // store tenant slug

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const currentSlug = window.location.hostname; // e.g., "localhost" or real domain
        setSlug(currentSlug); // save it for Links

        const res = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/all?slug=${currentSlug}`
        );
        setPlans(res.data.data || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]);
      }
    };

    fetchPlans();
  }, []);

  if (plans.length === 0) {
    return null;
  }

  return (
    <footer className="bg-black text-light py-4 position-relative">
      <div className="container position-relative">

        {/* Back to Home - Left */}
        <div className="position-absolute d-none d-lg-block start-2 mt-3 translate-middle-y">
       <span
  onClick={() => {
    const path = window.location.pathname;

    // Detect if user is on any policy page
    const isPolicyPage =
      path.includes("Terms") ||
      path.includes("Privacy") ||
      path.includes("Shipping") ||
      path.includes("Cancellation") ||
      path.includes("Contact");

    if (isPolicyPage) {
      const hostname = window.location.hostname;

      // If localhost → redirect to root
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        window.location.href = "/";
      } else {
        // Production domain → redirect to home
        window.location.href = `https://${hostname}`;
      }
    } else {
      // Landing page → old behavior → scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }}
  className="text-light fw-bold text-decoration-underline cursor-pointer"
>
  ← Back to Home
</span>

        </div>

        {/* Copyright - Center */}
        <div className="text-center">
          <p className="mb-0">
            &copy; 2025{' '}
            <a
              href="https://www.coinagesoft.com/"
              className="underline text-blue-300 hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coinage Inc.
            </a>{' '}
            All rights reserved.
          </p>
        </div>

        {/* Links below - optional */}
       <div className="mt-2 text-center">
  <Link
    href={{ pathname: "/Terms", query: { slug } }}
    className="text-light small me-2"
  >
    Terms and Conditions
  </Link>

  <Link
    href={{ pathname: "/Cancellation", query: { slug } }}
    className="text-light small me-2"
  >
    Cancellation & Refund Policy
  </Link>

  <Link
    href={{ pathname: "/Shipping", query: { slug } }}
    className="text-light small me-2"
  >
    Shipping & Delivery Policy
  </Link>

  <Link
    href={{ pathname: "/PrivacyPolicy", query: { slug } }}
    className="text-light small me-2"
  >
    Privacy Policy
  </Link>

  <Link
    href={{ pathname: "/Contact", query: { slug } }}
    className="text-light small"
  >
    Contact Us
  </Link>
</div>


      </div>
    </footer>
  );
};

export default Footer;
