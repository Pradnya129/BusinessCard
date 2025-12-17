'use client';

import axios from 'axios';
import React, { forwardRef, useEffect, useState } from 'react';
import './Plans.css';
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import ThreeDotsLoader from './ThreeDotsLoader.js';

const Plans = React.forwardRef(({ onReady }, ref) => {

  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [slug, setSlug] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const [formData, setFormData] = useState({
    tagline: '',
    mainDescription: '',
    mainHeading: '',
  });

  const [plans, setPlans] = useState([]);

  /* -------------------- BOOK NOW HANDLER -------------------- */
  const handleBookNow = (plan) => {
    setIsNavigating(true); // show loader immediately

    setTimeout(() => {
      router.push(
        `/${slug}/CalendarOnly?planId=${plan.planId}&planName=${plan.planName}&planDuration=${plan.planDuration}&planPrice=${plan.planPrice}`
      );
    }, 150); // short delay = better UX
  };

  /* -------------------- FETCH DATA -------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        let resolvedSlug = '';

        if (hostname.includes('www.appointify.me') || hostname.includes('localhost')) {
          resolvedSlug = pathname.split('/')[1];
        } else {
          resolvedSlug = hostname;
        }

        setSlug(resolvedSlug);

        const res = await axios.get(
          `https://appo.coinagesoft.com/api/public-landing/?slug=${resolvedSlug}`
        );

        const data = res.data.data;

        setFormData({
          tagline: data.section5_Tagline || '',
          mainDescription: data.section5_MainDescription || '',
          mainHeading: data.section5_MainHeading || '',
        });
      } catch (error) {
        console.error('Error fetching landing data:', error);
      }
    };

    const fetchPlans = async () => {
      try {
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        let resolvedSlug = '';

        if (hostname.includes('www.appointify.me') || hostname.includes('localhost')) {
          resolvedSlug = pathname.split('/')[1];
        } else {
          resolvedSlug = hostname;
        }

        const [plansRes] = await Promise.all([
          axios.get(
            `https://appo.coinagesoft.com/api/public-landing/all?slug=${resolvedSlug}`
          )
        ]);

        setPlans(plansRes.data.data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      }finally {
    onReady && onReady(); // ✅ VERY IMPORTANT
  }
    };

    fetchData();
    fetchPlans();
  }, []);

  if (plans.length === 0) return null;

  return (
    <>
      {/* -------------------- FULL SCREEN LOADER -------------------- */}
      {isNavigating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <ThreeDotsLoader />
        </div>
      )}

      {/* -------------------- PAGE CONTENT -------------------- */}
      <div className="page-wrapper">
        {/* Hero */}
        <div
          className="position-relative bg-img-start"
          style={{ backgroundImage: 'url(dist/assets/svg/components/card-11.svg)' }}
        />

        {/* Plans Section */}
        <div className="container py-5">
          <div className="container">
             <div className="d-flex align-items-center mb-3" style={{ padding: 10 }}>
        <button
          type="button"
          onClick={() => router.back()}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40, // similar circular size
            height: 40, // height same as width
            fontSize: 20,
            fontWeight: 800,
            borderRadius: "50%",
            border: "1px solid #d0d0d0",
            backgroundColor: hover ? "#e6f0ff" : "#f8f9fa",
            color: hover ? "#0c6cd3" : "#0f65c7",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <FaArrowLeft />

        </button>
      </div>
            <div
              className="w-md-75 w-lg-70 text-center mx-auto mb-9"
              id="target-plans"
              ref={ref}
            >
              <h2>{formData.tagline}</h2>
              <p>{formData.mainDescription}</p>
            </div>
          </div>

          <div className="row justify-content-center">
            {plans.map((plan) => (
              <div className="col-md-6 col-lg-4 mb-4" key={plan.planId}>
                <div className="card h-100 bg-primary text-white shadow-sm border-0 d-flex flex-column">

                  {/* Duration */}
                  <div className="text-center pt-4">
                    <span className="bg-white text-primary fw-bold px-3 py-1 rounded-pill">
                      ⏱ {plan.planDuration} minutes
                    </span>
                  </div>

                  {/* Body */}
                  <div className="card-body d-flex flex-column pt-3 px-4">
                    <h5 className="fw-bold text-center text-white">{plan.planName}</h5>
                    <p className="text-white-75 small text-center">
                      {plan.planDescription}
                    </p>

                    <ul>
                      {(() => {
                        let features = [];
                        try {
                          if (Array.isArray(plan.planFeatures)) {
                            features = plan.planFeatures;
                          } else if (typeof plan.planFeatures === 'string') {
                            features = JSON.parse(plan.planFeatures);
                          }
                        } catch {}
                        return features.map((f, i) => <li key={i}>{f}</li>);
                      })()}
                    </ul>

                    <div className="flex-grow-1" />
                  </div>

                  {/* Footer */}
                  <div className="card-footer bg-transparent border-0 text-center pb-4">
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      <div className="bg-white text-primary fw-bold rounded px-4 py-2 fs-5">
                        ₹{plan.planPrice}
                      </div>

                      <button
                        className="btn fw-semibold text-white px-4 py-2 rounded shadow"
                        style={{
                          backgroundColor: '#7d85f9',
                          border: 'none',
                          boxShadow: '0 0 12px rgba(125,133,249,0.5)',
                        }}
                        onClick={() => handleBookNow(plan)}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});

Plans.displayName = 'Plans';
export default Plans;
