'use client';
import React, { useState, useEffect } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
const API_URL = process.env.REACT_APP_API_URL;
const Plan_Widget = () => {
  const [stats, setStats] = useState({
    totalPlans: 0,
    latestPlanCount: 0, // Number of latest plans
    popularPlanCount: 0, // Number of popular plans
  });

useEffect(() => {
  const token = localStorage.getItem("token");

  fetch(`https://appo.coinagesoft.com/api/admin/plans/all`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((response) => response.json())
    .then((result) => {
      const plans = result.data || [];
      const totalPlans = plans.length;

      let latestPlanCount = 0;
      let popularPlanCount = 0;

      if (plans.length > 0) {
        // Latest plans = created within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        latestPlanCount = plans.filter(
          (plan) => new Date(plan.createdAt) > thirtyDaysAgo
        ).length;

        // Popular plans = price >= threshold
        const priceThreshold = 1000;
        popularPlanCount = plans.filter(
          (plan) => parseFloat(plan.planPrice) >= priceThreshold
        ).length;
      }

      setStats({
        totalPlans,
        latestPlanCount,
        popularPlanCount,
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
}, []);

  return (
     <div className="row g-4 mb-4">
      <div className="col-sm-6 col-xl-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div className="me-2">
                <p className="text-heading mb-1">Total Plans</p>
                <h4 className="mb-1">{stats.totalPlans}</h4>
                <small className="text-muted">All available plans</small>
              </div>
              <div className="avatar">
                <div className={`avatar-initial bg-label-primary rounded-3`}>
                  <i className="fas fa-folder fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-xl-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div className="me-2">
                <p className="text-heading mb-1">Latest Plans</p>
                <h4 className="mb-1">{stats.latestPlanCount}</h4>
                <small className="text-muted">Plans added in the last 30 days</small>
              </div>
              <div className="avatar">
                <div className={`avatar-initial bg-label-info rounded-3`}>
                  <i className="fas fa-clock fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-sm-6 col-xl-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div className="me-2">
                <p className="text-heading mb-1">Popular Plans</p>
                <h4 className="mb-1">{stats.popularPlanCount}</h4>
                <small className="text-muted">Plans with price above 1000</small>
              </div>
              <div className="avatar">
                <div className={`avatar-initial bg-label-warning rounded-3`}>
                  <i className="fas fa-star fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan_Widget;
