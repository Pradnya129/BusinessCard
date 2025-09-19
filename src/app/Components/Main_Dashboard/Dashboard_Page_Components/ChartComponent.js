'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Chart,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PieController,
  LineController,
} from 'chart.js';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

Chart.register(
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PieController,
  LineController
);

const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#C9CBCF', '#8BC34A', '#E91E63', '#00BCD4',
  '#795548', '#607D8B', '#F44336', '#3F51B5', '#009688',
  '#CDDC39', '#FFC107', '#9C27B0', '#03A9F4', '#673AB7',
];

const ChartComponent = () => {
  const revenueChartRef = useRef(null);
  const growthChartRef = useRef(null);
  const revenueChartInstance = useRef(null);
  const growthChartInstance = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [planNames, setPlanNames] = useState([]);
  const [revenueByPlan, setRevenueByPlan] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        const [appointmentsRes, plansRes] = await Promise.all([
          axios.get(`https://appo.coinagesoft.com/api/customer-appointments/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://appo.coinagesoft.com/api/admin/plans/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const appointmentsData = appointmentsRes.data.data || [];
        const plansData = plansRes.data || [];

        setAppointments(appointmentsData);
        setPlanNames(plansData.map(plan => plan.planName.trim()));
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!appointments.length) return;

    // Destroy existing charts
    revenueChartInstance.current?.destroy();
    growthChartInstance.current?.destroy();

    // PIE CHART
    const revenueMap = {};
    appointments.forEach(appt => {
      if (appt.paymentStatus === "Paid") {
        const plan = (appt.plan || "Unknown").trim();
        const amount = parseFloat(appt.amount) || 0;
        if (!revenueMap[plan]) revenueMap[plan] = 0;
        revenueMap[plan] += amount;
      }
    });
    setRevenueByPlan(revenueMap);

    revenueChartInstance.current = new Chart(revenueChartRef.current, {
      type: 'pie',
      data: {
        labels: Object.keys(revenueMap),
        datasets: [{
          label: 'Revenue by Plan',
          data: Object.values(revenueMap),
          backgroundColor: Object.keys(revenueMap).map((_, i) => colorPalette[i % colorPalette.length])
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
            }
          },
          legend: { display: true }
        }
      }
    });

    // LINE CHART - Updated to properly show weekly appointment growth
    const weeks = [0, 0, 0, 0, 0];
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    appointments.forEach(appt => {
      if (!appt.createdAt) return;
      const d = new Date(appt.appointmentDate);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        const week = Math.floor((d.getDate() - 1) / 7);
        if (week >= 0 && week < 5) weeks[week]++;
      }
    });

    growthChartInstance.current = new Chart(growthChartRef.current, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        datasets: [{
          label: 'Appointments (This Month)',
          data: weeks,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255,99,132,0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Appointments Count' } },
          x: { title: { display: true, text: 'Weeks' } }
        }
      }
    });

    return () => {
      revenueChartInstance.current?.destroy();
      growthChartInstance.current?.destroy();
    };
  }, [appointments]);

  return (
    <>
      {/* Revenue by Plan */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="text-center mb-4">Revenue by Plan</h5>
          <div className="row g-4">
            <div className="col-md-6 col-12 d-flex justify-content-center align-items-center">
              <div style={{ width: '100%', maxWidth: '300px' }}>
                <canvas ref={revenueChartRef}></canvas>
              </div>
            </div>
            <div className="col-md-6 col-12">
              <ul className="list-unstyled m-0">
                {Object.entries(revenueByPlan).map(([plan, value], index) => (
                  <li key={index} className="d-flex align-items-start gap-2 mb-3" style={{ borderBottom: '1px dashed #ddd', paddingBottom: '8px' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: colorPalette[index % colorPalette.length], flexShrink: 0, marginTop: '5px' }}></span>
                    <div className="flex-grow-1">
                      <div className="fw-medium" style={{ wordBreak: 'break-word' }}>{plan}</div>
                      <div className="text-muted small">₹{value.toLocaleString('en-IN')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Growth */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="text-center mb-3">Appointments Growth (This Month)</h5>
          <div style={{ height: '300px' }}>
            <canvas ref={growthChartRef} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartComponent;
