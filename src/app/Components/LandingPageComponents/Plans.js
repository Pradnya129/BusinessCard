'use client';
import axios from 'axios';
import React, { forwardRef, useEffect, useState } from 'react';
import './Plans.css'

const API_URL = process.env.REACT_APP_API_URL;

const Plans = React.forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    tagline: '',
    mainDescription: '',
    mainHeading: '',
  });

  const [plans, setPlans] = useState([]);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Get slug from hostname first (production)
       const hostname = window.location.hostname; // "www.appointify.me" or "www.aura-enterprises.in"
const pathname = window.location.pathname; // "/aura-enterprises" or "/"

// Determine slug
let slug = "";

// If main domain
if (hostname.includes("appointify.me")) {
  slug = pathname.split("/")[1]; // get slug from URL path
} else {
  // Custom domain → send hostname as slug
  slug = hostname;
}


        // Fetch landing page data for this slug
        const res = await axios.get(`https://appo.coinagesoft.com/api/public-landing/?slug=${slug}`);
        const data = res.data.data;

        setFormData({
          tagline: data.section5_Tagline || '',
          mainDescription: data.section5_MainDescription || '',
          mainHeading: data.section5_MainHeading || '',
        });
      } catch (error) {
        console.error("Error fetching landing data:", error);
      }
    };

    const fetchPlans = async () => {
      try {
        // ✅ Get slug from hostname/pathname
        let slug = window.location.hostname;


        // Fetch plans and shifts with slug
        const [plansRes, shiftsRes] = await Promise.all([
          axios.get(`https://appo.coinagesoft.com/api/public-landing/all?slug=${slug}`),
          axios.get(`https://appo.coinagesoft.com/api/public-landing/all-shifts?slug=${slug}`),
        ]);

        setPlans(plansRes.data.data || []);
        setShifts(shiftsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching plans or shifts:', error);
        setPlans([]);
        setShifts([]);
      }
    };

    fetchData();
    fetchPlans();
  }, []);

  if (plans.length === 0) {
    return null
  }
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div
        className="position-relative bg-img-start"
        style={{ backgroundImage: 'url(dist/assets/svg/components/card-11.svg)' }}
      >
        {/* after checking this in swagger getting 404. need to check backend */}
        {/* <div className="container ">
          <div className="w-md-75 w-lg-70 text-center mx-auto mb-9" id="target-plans" ref={ref} >
            <h2>{formData.tagline}</h2>
            <p>{formData.mainDescription}</p>
           
          </div>
        </div> */}
      </div>

      {/* Plan Cards */}
      <div className="container py-5"> {/* Section spacing */}
        {/* <div className="text-center mb-5">
          <h2 className="fw-bold">Our Consultation Plans</h2>
          <p className="text-muted">Choose the plan that fits your needs</p>
        </div> */}

        <div className="container ">
          <div className="w-md-75 w-lg-70 text-center mx-auto mb-9" id="target-plans" ref={ref} >
            <h2>{formData.tagline}</h2>
            <p>{formData.mainDescription}</p>
            {/* <h3 className="mt-9 mb-0">{formData.mainHeading}</h3> */}
          </div>
        </div>

        <div className="row justify-content-center">
          {plans.map((plan) => (
            <div className="col-md-6 col-lg-4 mb-4" key={plan.planId}>
              <div className="card h-100 bg-primary text-white shadow-sm border-0 d-flex flex-column position-relative">

                {/* Minutes Badge at Top Center */}
                <div className="text-center pt-4">
                  <span
                    className="bg-white text-primary fw-bold px-3 py-1 rounded-pill shadow-sm"
                    style={{ fontSize: '0.95rem' }}
                  >
                    ⏱ {plan.planDuration} minutes
                  </span>
                </div>

                {/* Card Body */}
                <div className="card-body d-flex flex-column pt-3 px-4">
                  {/* Plan Name */}
                  <h5 className="fw-bold mb-2 text-white text-center">{plan.planName}</h5>

                  {/* Plan Description */}
                  <p className="text-white-75 small mb-3 text-center">{plan.planDescription}</p>

                  {/* Plan Features */}
                  <div >
                    <ul>
                      {(() => {
                        let features = [];

                        try {
                          if (Array.isArray(plan.planFeatures)) {
                            features = plan.planFeatures;
                          } else if (typeof plan.planFeatures === 'string' && plan.planFeatures.trim()) {
                            const parsed = JSON.parse(plan.planFeatures);
                            if (Array.isArray(parsed)) features = parsed;
                          }
                        } catch (err) {
                          console.warn('⚠️ Invalid planFeatures format:', plan.planFeatures, err);
                        }

                        return features.map((f, i) => <li key={i}>{f}</li>);
                      })()}
                    </ul>

                  </div>

                  <div className="flex-grow-1"></div>
                </div>

                {/* Card Footer */}
                <div className="card-footer bg-transparent border-0 text-center pb-4">
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    {/* Price */}
                    <div className="bg-white text-primary fw-bold rounded px-4 py-2 fs-5 shadow-sm">
                      ₹{plan.planPrice}
                    </div>

                    {/* Book Now Button */}
                    <button
                      type="button"
                      className="btn fw-semibold text-white px-4 py-2 rounded shadow"
                      style={{
                        backgroundColor: '#7d85f9',
                        border: 'none',
                        boxShadow: '0 0 12px rgba(125,133,249,0.5)',
                        transition: 'all 0.3s ease-in-out',
                      }}
                      onClick={() =>
                        props.scrollToSection({
                          planName: plan.planName,
                          planPrice: plan.planPrice,
                          planDuration: plan.planDuration,
                        })
                      }
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
  );
});

Plans.displayName = "Plans";
export default Plans;
