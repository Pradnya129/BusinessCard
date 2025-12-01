'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CountUp from 'react-countup';

const Stats = () => {
  const [stats, setStats] = useState([]);

  const iconList = ['bi-bar-chart-line-fill', 'bi-graph-up', 'bi-emoji-smile-fill'];

useEffect(() => {
  const fetchStats = async () => {
    try {
      // ✅ Get slug from hostname (production) or fallback to pathname (localhost)
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
     console.log("slug",slug)

      // Fetch stats with slug
      const res = await axios.get(`https://appo.coinagesoft.com/api/public-landing/all-stats?slug=${slug}`);
      console.log("stats response:", res.data);
      setStats(res.data.data || []);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats([]);
    }
  };

  fetchStats();
}, []);

if( stats.length === 0){
  return null
}
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
            const value = parseFloat(stat.value) || 0;

            return (
              <div className="col-sm-6 col-md-4 mb-4" key={stat.id || index}>
                <div className="card h-100 shadow-sm border-0 text-center">
                  <div className="card-body">
                    <div className="mb-3">
                      <i className={`${iconClass} ${trendClass}`} style={{ fontSize: '2rem' }}></i>
                    </div>

                    <h2 className={`display-6 fw-bold ${trendClass}`}>
                      <CountUp
                        end={value}
                        duration={2}
                        decimals={2}
                        suffix="%" // always show percentage
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
