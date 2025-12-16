'use client';

import React, { useRef, useState, useEffect } from 'react';
// import '../../../dist/assets/css/theme.min.css';
import './LandingPage.css';
import Head from 'next/head';
import Plans from '../Components/LandingPageComponents/Plans';
import BusinessProfile from '../Components/LandingPageComponents/BusinessProfile.js'

const LandingPage = ({ admin, onPlansReady }) => {
  const plansWrapperRef = useRef(null);

  // Detect when Plans component finally renders DOM
  useEffect(() => {
    const target = plansWrapperRef.current;
    if (!target) return;

    const observer = new MutationObserver(() => {
      if (target.children.length > 0) {
        onPlansReady?.();     // Tell parent: Plans are ready
        observer.disconnect();
      }
    });

    observer.observe(target, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Head>
        <link
          rel="preload"
          href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.7/semantic.min.css"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <link
          rel="preload"
          href="/dist/assets/vendor/bootstrap/dist/css/bootstrap.min.css"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        {typeof window !== "undefined" && (
          <link rel="stylesheet" href="/dist/assets/css/theme.min.css" />
        )}
      </Head>

      <div className="bg-white">
        <div className="">

          {/* Wrapper that we observe for DOM changes */}
          <div
            className=""
            ref={plansWrapperRef}
          >
            {/* <Plans
              scrollToSection={() => {}}
              selectedPlan={{}}
              admin={admin}
            /> */}
          <BusinessProfile  admin={admin}/>
          </div>

        </div>
      </div>
    </>
  );
};

export default LandingPage;