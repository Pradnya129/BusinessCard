'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Plans from '../../Components/LandingPageComponents/Plans.js';
import ThreeDotsLoader from '../../Components/LandingPageComponents/ThreeDotsLoader.js';

const Page = () => {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [prefillData, setPrefillData] = useState(null);

  useEffect(() => {
    const planId = searchParams.get("planId") || "";
    const planDuration = searchParams.get("planDuration") || "";
    const selectedDate = searchParams.get("selectedDate") || "";
    const selectedSlot = searchParams.get("selectedSlot") || "";
    const planName = searchParams.get("planName") || "";
    const planPrice = searchParams.get("planPrice") || "";

    setPrefillData({
      planId,
      planDuration,
      selectedDate,
      selectedSlot,
      planName,
      planPrice,
    });

    // small delay ensures smooth transition
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, [searchParams]);

  /* FULL SCREEN LOADER */
  if (loading || !prefillData) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <ThreeDotsLoader />
      </div>
    );
  }

  return <Plans />;
};

export default Page;
