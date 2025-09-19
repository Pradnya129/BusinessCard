'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CountUp from 'react-countup';

const Stats = () => {
  const [stats, setStats] = useState([]);

  // Custom icons assigned by index
  const iconList = [
    'bi-bar-chart-line-fill',
    'bi-graph-up',
    'bi-emoji-smile-fill'
  ];

useEffect(() => {
  const fetchStats = async () => {
    try {
      const pathParts = window.location.pathname.split("/");
      const slug = pathParts[pathParts.length - 1];
      const res = await axios.get(`http://localhost:5000/api/public-landing/all-stats/${slug}`);
      console.log(res.data)
      setStats(res.data.data || []); // ensure it's always an array
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats([]); // fallback
    }
  };

  fetchStats();
}, []);


  return (
    <div className="rounded-2 mx-3 mx-lg-10">
      <div className="container bg-white content-space-2 mt-5 pt-5">
        <div className="row justify-content-center mb-5">
          <div className="col-md-8 text-center">
            <h2>Our Achievements</h2>
            <p className="text-muted">These numbers speak for the trust and impact we’ve created.</p>
          </div>
        </div>

        <div className="row justify-content-center">
          {stats.map((stat, index) => {
            const iconClass = iconList[index % iconList.length] || 'bi-bar-chart';
            const trendClass = stat.icon === 'down' ? 'text-danger' : 'text-primary';

            return (
              <div className="col-sm-6 col-md-4 mb-4" key={stat.id || index}>
                <div className="card h-100 shadow-sm border-0 text-center">
                  <div className="card-body">
                    <div className="mb-3">
                      <i className={`${iconClass} ${trendClass}`} style={{ fontSize: '2rem' }}></i>
                    </div>

                    <h2 className={`display-6 fw-bold ${trendClass}`}>
                      <CountUp
                        end={parseInt(stat.value.replace(/[^\d]/g, ''), 10) || 0}
                        duration={2}
                        suffix="%"
                      />
                    </h2>
                    <p className="mb-0">
                      <strong>{stat.description}</strong>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stats;
