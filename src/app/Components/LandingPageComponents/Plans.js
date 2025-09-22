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
      // ✅ Get slug from URL path (e.g., /landing/pradnya → "pradnya")
      const pathParts = window.location.pathname.split("/");
      const slug = pathParts[pathParts.length - 1];

      const res = await axios.get(`https://appo.coinagesoft.com/api/public-landing/${slug}`);
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
    const token = localStorage.getItem('token');
    try {
      // ✅ Use slug to fetch plans/shifts for public landing if needed
      const pathParts = window.location.pathname.split("/");
      const slug = pathParts[pathParts.length - 1];

      const [plansRes, shiftsRes] = await Promise.all([
        axios.get(`https://appo.coinagesoft.com/api/public-landing/all/${slug}`, {
        }),
        axios.get(`https://appo.coinagesoft.com/api/public-landing/all-shifts/${slug}`, {
        }),
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
                    <ul >
                      {(Array.isArray(plan.planFeatures) ? plan.planFeatures : JSON.parse(plan.planFeatures || '[]')).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
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
