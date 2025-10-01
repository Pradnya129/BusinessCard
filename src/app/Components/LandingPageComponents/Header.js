'use client';

import React, { useEffect, useState } from 'react';
import '../../../../dist/assets/vendor/aos/dist/aos.css';
import '../../../../dist/assets/vendor/bootstrap-icons/font/bootstrap-icons.css';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Header = () => {
  const [ConsultantData, setConsultantData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Get slug from hostname
        let slug = window.location.hostname;

        if (!slug) throw new Error("Slug not found in hostname");

        // ✅ Call slug-based API
        const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
        if (!response.ok) throw new Error("Failed to fetch landing page data");

        const result = await response.json();
        console.log("Landing Page Data:", result.data);

        setConsultantData(result.data || {});
      } catch (error) {
        console.error("Error fetching landing page data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <header id="header" className="navbar navbar-expand-lg navbar-end bg-primary position-fixed top-0 start-0 w-100 z-50 shadow-sm">
      <div className="container">
        <div className="w-100 d-flex justify-content-between d-none d-lg-flex">
          <div className="d-flex flex-column flex-md-row">
            <ul className="navbar-nav me-md-3">
              <li className="nav-item">
                <a
                  className="btn btn-light font-semibold btn-xs text-xs"
                  href={ConsultantData.locationURL ?? "https://www.google.com/maps?q=Apollo+Hospital,+Mumbai"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🏥 {ConsultantData.hospitalClinicAddress || "Apollo Hospital, Mumbai"}
                </a>
              </li>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item">
                <a
                  className="btn btn-light btn-xs text-xs font-extrabold"
                  href={`mailto:${ConsultantData.email || "info@example.com"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📧 {ConsultantData.email || "info@example.com"}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media and Login Button */}
          <ul className="navbar-nav d-flex align-items-center">
            <li className="nav-item d-flex gap-2">
              {ConsultantData.facebookId && (
                <a className="btn btn-soft-light rounded bg-light text-dark btn-xs btn-icon"
                   href={ConsultantData.facebookId} target="_blank" rel="noopener noreferrer">
                  <i className="bi-facebook"></i>
                </a>
              )}

              {ConsultantData.youtubeId && (
                <a className="btn btn-soft-light rounded bg-light text-dark btn-xs btn-icon"
                   href={ConsultantData.youtubeId} target="_blank" rel="noopener noreferrer">
                  <i className="bi-youtube"></i>
                </a>
              )}

              {ConsultantData.twitterId && (
                <a className="btn btn-soft-light rounded bg-light text-dark btn-xs btn-icon"
                   href={ConsultantData.twitterId} target="_blank" rel="noopener noreferrer">
                  <i className="bi-twitter"></i>
                </a>
              )}

              {ConsultantData.instagramId && (
                <a className="btn btn-soft-light rounded bg-light text-dark btn-xs btn-icon"
                   href={ConsultantData.instagramId} target="_blank" rel="noopener noreferrer">
                  <i className="bi-instagram"></i>
                </a>
              )}
            </li>

            {/* Login Button */}
            <li className="nav-item ms-4 mt-2 mt-md-0">
              <Link href="/Login" className="btn bg-light py-2 btn-transition font-thin ms-5 responsive-btn text-decoration-none">
                Log in
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Login */}
        <div className="d-flex d-lg-none justify-content-end w-100">
          <Link href="/Login" className="btn bg-light py-2 btn-transition font-thin ms-5 responsive-btn text-decoration-none">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
