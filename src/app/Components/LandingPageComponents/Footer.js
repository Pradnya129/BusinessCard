'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const Footer = () => {
 const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        let slug = window.location.hostname;
       

        const res = await axios.get(`https://appo.coinagesoft.com/api/public-landing/all?slug=${slug}`);
        setPlans(res.data.data || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans([]);
      }
    };

    fetchPlans();
  }, []);

  if( plans.length === 0){
  return null
}
  return (
    <footer className="bg-black text-light py-4 position-relative">
      <div className="container position-relative">

        {/* Back to Home - Left */}
        <div className="position-absolute start-2 mt-3 translate-middle-y">
          <span
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-light fw-bold text-decoration-underline cursor-pointer"
          >
            ← Back to Home
          </span>
        </div>

        {/* Copyright - Center */}
        <div className="text-center">
          <p className="mb-0">
            &copy; 2025{" "}
            <a
              href="https://www.coinagesoft.com/"
              className="underline text-blue-300 hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coinage Inc.
            </a>{" "}
            All rights reserved.
          </p>
        </div>

        {/* Links below - optional */}
        <div className="mt-2 text-center">
          <Link href="/Terms" className="text-light small me-2">Terms and Conditions</Link>
          <Link href="/Cancellation" className="text-light small me-2">Cancellation & Refund Policy</Link>
          <Link href="/Shipping" className="text-light small me-2">Shipping & Delivery Policy</Link>
          <Link href="/PrivacyPolicy" className="text-light small me-2">Privacy Policy</Link>
          <Link href="/Contact" className="text-light small">Contact Us</Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
