'use client';

import React, { useEffect, useState } from 'react';
import ChartComponent from './ChartComponent';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const Dashboard_Content = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    scheduled_rescheduledAppointment: 0,
    completedSessions: 0,
    paymentReceived: 0,
    totalRevenue: 0,
    avgDuration: '0h 0m'
  });

  const [appointmentData, setAppointmentData] = useState([]);
  const [slug, setSlug] = useState("");          // ✅ added
  const [isSaving, setIsSaving] = useState(false); // ✅ added
  const [adminId, setAdminId] = useState(null);  // ✅ store adminId
  const [token, setToken] = useState(null);      // ✅ store token

  // Helper: Convert minutes → hh:mm
  const formatMinutesToHHMM = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 10000) return '0h 0m';
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hrs}h ${mins}m`;
  };

 useEffect(() => {
  const storedToken = localStorage.getItem("token");
  if (!storedToken) return;

  setToken(storedToken);
  const decoded = jwtDecode(storedToken); // decode JWT
  const adminId = decoded.id; // current admin ID
  setAdminId(adminId);

  // --- FETCH ADMIN SLUG ---
 // Example: fetch admin data using slug from query param
axios.get(`https://appo.coinagesoft.com/api/admin/slugbyAdminId/${adminId}`, {
})
.then((res) => {
  // res.data contains the admin info for this slug
  if (res.data?.data) {
    setUser(res.data.data);
    setSlug(res.data.data.slug); // set slug from response
  }
})
.catch((err) => console.error("Failed to fetch slug:", err));

  // --- FETCH CUSTOMER APPOINTMENTS ---
  axios
    .get(`https://appo.coinagesoft.com/api/customer-appointments/`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
    .then((res) => {
      const appointments = res.data?.data || [];
      if (appointments.length === 0) return;

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      const sorted = [...appointments].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const startDate = new Date(sorted[0].createdAt);
      const endDate = new Date();

      const monthYearMap = new Map();
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

      while (
        cursor.getFullYear() < endDate.getFullYear() ||
        (cursor.getFullYear() === endDate.getFullYear() && cursor.getMonth() <= endDate.getMonth())
      ) {
        const key = `${monthNames[cursor.getMonth()]}-${cursor.getFullYear()}`;
        monthYearMap.set(key, {
          totalAppointments: 0,
          pending: 0,
          completed: [],
          canceled: 0,
          rescheduled: 0,
          paid: [],
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      // Populate monthYearMap
      appointments.forEach((item) => {
        const date = new Date(item.createdAt);
        const key = `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
        const group = monthYearMap.get(key);
        if (!group) return;

        group.totalAppointments += 1;

        switch (item.appointmentStatus) {
          case "Pending":
            group.pending += 1;
            break;
          case "Completed":
            group.completed.push(item);
            break;
          case "Canceled":
            group.canceled += 1;
            break;
          case "Rescheduled":
            group.rescheduled += 1;
            break;
          default:
            break;
        }

        if (item.paymentStatus === "Paid") group.paid.push(item);
      });

      // Prepare monthly table data
      const monthlyData = [];
      monthYearMap.forEach((group, key) => {
        const paidCount = group.paid.length;
        const revenue = group.paid.reduce(
          (sum, item) => sum + parseFloat(item.amount || 0),
          0
        );

        const totalDuration = group.paid.reduce((sum, item) => {
          const duration = parseFloat(item.duration);
          return Number.isFinite(duration) && duration > 0 && duration < 10000
            ? sum + duration
            : sum;
        }, 0);

        const avgDuration = paidCount > 0
          ? formatMinutesToHHMM(Math.round(totalDuration / paidCount))
          : "0h 0m";

        monthlyData.push({
          month: key,
          revenue: `₹${revenue.toLocaleString("en-IN")}`,
          totalAppointments: group.totalAppointments,
          pending: group.pending,
          completed: group.completed.length,
          canceled: group.canceled,
          avgTime: avgDuration,
        });
      });

      // Stats for dashboard widgets
      const paidAppointments = appointments.filter(
        (item) => item.paymentStatus === "Paid"
      );
      const totalRevenue = paidAppointments.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
      );

      const totalDuration = paidAppointments.reduce(
        (sum, item) => sum + parseFloat(item.duration || 0),
        0
      );

      const avgDuration = paidAppointments.length > 0
        ? formatMinutesToHHMM(Math.round(totalDuration / paidAppointments.length))
        : "0h 0m";

      setStats({
        totalAppointments: appointments.length,
        scheduled_rescheduledAppointment: appointments.filter((item) =>
          ["Scheduled", "Rescheduled"].includes(item.appointmentStatus)
        ).length,
        completedSessions: appointments.filter(
          (item) => item.appointmentStatus === "Completed"
        ).length,
        paymentReceived: totalRevenue,
        totalRevenue,
        avgDuration,
      });

      setAppointmentData(monthlyData);
    })
    .catch((error) => {
      console.error("Failed to fetch dashboard data:", error);
    });
}, []);


const handleSaveSlug = async () => {
  if (!adminId || !token) return;
  setIsSaving(true);

  try {
    // Use edit-slug endpoint for updating
    const response = await axios.put(
      "https://appo.coinagesoft.com/api/admin/edit-slug",
      {
        adminId,
        slug, // new slug value
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("Slug updated successfully!");
    setSlug(slug); // update local state
    window.history.pushState({}, "", `/${slug}`); // update URL
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update slug");
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="content-wrapper">
      <div className="container-md-xxl container-p-y responsive-container">

        {/* Slug Input */}
        <div className="d-flex justify-content-end align-items-center mb-3">
          {/* <div className="input-group" style={{ maxWidth: "300px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <button
              className="btn btn-primary"
              disabled={isSaving}
              onClick={handleSaveSlug}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div> */}
        </div>

        {/* Stats Widgets */}
        <div className="row g-4 mb-4">
          {[
            { title: 'Total Appointments', icon: 'ri-calendar-check-line', color: 'primary', value: stats.totalAppointments },
            { title: 'Scheduled/Rescheduled Appointments', icon: 'ri-time-line', color: 'warning', value: stats.scheduled_rescheduledAppointment },
            { title: 'Completed Sessions', icon: 'ri-check-double-line', color: 'danger', value: stats.completedSessions },
            { 
              title: 'Payment Received', 
              icon: 'ri-refresh-line', 
              color: 'info', 
              value: `₹${Number(stats.paymentReceived).toLocaleString('en-IN')}` 
            }
          ].map((item, idx) => (
            <div key={idx} className="col-sm-6 col-lg-3">
              <div className={`card card-border-shadow-${item.color} h-100`}>
                <div className="card-body d-flex flex-column justify-content-between">
                  <h6 className="text-heading">{item.title}</h6>
                  <div className="d-flex align-items-center mb-3">
                    <div className="avatar me-3">
                      <span className={`avatar-initial rounded-circle bg-label-${item.color} p-3`}>
                        <i className={`${item.icon} ri-24px text-white`}></i>
                      </span>
                    </div>
                    <h3 className={`mb-0 fw-bold text-${item.color}`}>{item.value}</h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart and Table Section */}
        <div className="row g-4">
          {/* Chart */}
          <div className="">
            <ChartComponent />
          </div>

          {/* Table */}
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <div className="card-title mb-0">
                  <h5 className="m-0 me-2">Revenue & Appointments Overview</h5>
                  <p className="text-muted small m-0">* All consultations are prepaid online</p>
                </div>
              </div>
              <div className="card-body pb-2">
                <div className="table-responsive">
                  <table className="table card-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Revenue</th>
                        <th>Total Appointments</th>
                        <th>Pending</th>
                        <th>Completed</th>
                        <th>Canceled</th>
                        <th>Avg. Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData.length > 0 ? appointmentData.map((data, index) => (
                        <tr key={index}>
                          <td>{data.month}</td>
                          <td>{data.revenue}</td>
                          <td>{data.totalAppointments}</td>
                          <td>{data.pending}</td>
                          <td>{data.completed}</td>
                          <td>{data.canceled}</td>
                          <td>{data.avgTime}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">No appointment data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Padding if fewer rows */}
                {appointmentData.length < 5 && (
                  <div style={{ height: `${(5 - appointmentData.length) * 40}px` }} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard_Content;
