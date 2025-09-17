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
    // Fetch data from the backend API
          const token = localStorage.getItem('token');

           fetch(`http://103.224.247.28:5000/api/admin/plans/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
      .then((response) => response.json())
      .then((data) => {
        const totalPlans = data.length;
         console.log(data)
        // Calculate the count for Latest and Popular plans
        let latestPlanCount = 0;
        let popularPlanCount = 0;

        if (data.length > 0) {
          // Find Latest Plans (example: plans created in the last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Calculate 30 days ago

          latestPlanCount = data.filter(plan => new Date(plan.createdAt) > thirtyDaysAgo).length;

          // Find Popular Plans (example: plans with price greater than a threshold)
          const priceThreshold = 1000; // Example threshold for popular plans
          popularPlanCount = data.filter(plan => plan.planPrice >= priceThreshold).length;
        }

        // Update the state
        setStats({
          totalPlans,
          latestPlanCount,
          popularPlanCount,
        });
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []); // Empty dependency array means this runs once when the component mounts

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
