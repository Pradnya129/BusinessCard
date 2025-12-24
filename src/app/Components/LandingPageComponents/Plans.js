'use client';

import axios from 'axios';
import React, { useEffect, useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import ThreeDotsLoader from './ThreeDotsLoader';
import './Plans.css';

const Plans = forwardRef(({ onReady }, ref) => {
  const router = useRouter();

  const [slug, setSlug] = useState('');
  const [plans, setPlans] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const [formData, setFormData] = useState({
    tagline: '',
    mainDescription: '',
    mainHeading: '',
  });

  /* -------------------- BOOK NOW -------------------- */
  const handleBookNow = (plan) => {
    setIsNavigating(true);

    setTimeout(() => {
      router.push(
        `/${slug}/CalendarOnly?planId=${plan.planId}&planName=${plan.planName}&planDuration=${plan.planDuration}&planPrice=${plan.planPrice}`
      );
    }, 150);
  };

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const resolveSlug = () => {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;

      if (hostname.includes('appointify.me') || hostname.includes('localhost')) {
        return pathname.split('/')[1];
      }
      return hostname;
    };

    const fetchAll = async () => {
      try {
        const resolvedSlug = resolveSlug();
        setSlug(resolvedSlug);

        const [landingRes, plansRes] = await Promise.all([
          axios.get(`https://appo.coinagesoft.com/api/public-landing/?slug=${resolvedSlug}`),
          axios.get(`https://appo.coinagesoft.com/api/public-landing/all?slug=${resolvedSlug}`)
        ]);

        const landing = landingRes.data.data;

        setFormData({
          tagline: landing.section5_Tagline || '',
          mainDescription: landing.section5_MainDescription || '',
          mainHeading: landing.section5_MainHeading || '',
        });

        setPlans(plansRes.data.data || []);
      } catch (err) {
        console.error(err);
        setPlans([]);
      } finally {
        onReady && onReady(); // 🔥 critical for loader
      }
    };

    fetchAll();
  }, []);

  if (!plans.length) return null;

  return (
    <>
      {/* FULLSCREEN NAVIGATION LOADER */}
      {isNavigating && (
        <div className="plans-full-loader">
          <ThreeDotsLoader />
        </div>
      )}

      {/* SHEET CONTENT */}
      <div className="plans-sheet" ref={ref}>
        {/* Sticky Header */}
        <div className="plans-header fancy">
          <span className="plans-chip">
            {formData.tagline || 'Choose a Plan'}
          </span>

          <p className="plans-sub">
            {formData.mainDescription}
          </p>
        </div>


        {/* Plans */}
        <div className="plans-list">
          {plans.map((plan) => {
            let features = [];
            try {
              features = Array.isArray(plan.planFeatures)
                ? plan.planFeatures
                : JSON.parse(plan.planFeatures || '[]');
            } catch { }

            return (
              <div className="plan-card" key={plan.planId}>
                <div className="plan-top">
                  <span>{plan.planDuration} min</span>
                  <span className="price">₹{plan.planPrice}</span>
                </div>

                <h5>{plan.planName}</h5>
                <p className="desc">{plan.planDescription}</p>

                {features.length > 0 && (
                  <ul className="features">
                    {features.map((f, i) => (
                      <li key={i}> {f}</li>
                    ))}
                  </ul>
                )}

                <button
                  className="book-btn"
                  onClick={() => handleBookNow(plan)}
                >
                  Book Now
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

Plans.displayName = 'Plans';
export default Plans;
