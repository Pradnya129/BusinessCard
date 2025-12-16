'use client';

import React, { useRef, useState, useEffect } from "react";
import CalendarOnly from '../../Components/LandingPageComponents/CalendarOnly.js';
import SkeletonLoader from '../../LandingPage/SkeltonLoader.js';
import { useSearchParams } from "next/navigation";

const Page = () => {
  const targetRef = useRef(null);
  const searchParams = useSearchParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const planId = searchParams.get("planId");
    const planDuration = searchParams.get("planDuration");
    const planName = searchParams.get("planName");
    const planPrice = searchParams.get("planPrice");

    setSelectedPlan({
      planId: planId || "",
      planDuration: Number(planDuration) || "",
      planName: planName || "",
      planPrice: planPrice || ""
    });

    setIsLoaded(true);
  }, [searchParams]);

  return (
    <div
      className="section-light"
      ref={targetRef}
      style={{ marginBottom: '14rem' }}
    >
      {isLoaded ? (
        <CalendarOnly prefillData={selectedPlan} />
      ) : (
        <SkeletonLoader height={350} />
      )}
    </div>
  );
};

export default Page;
