'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
const API_URL = process.env.REACT_APP_API_URL;
import { jwtDecode } from "jwt-decode";

const UsersWidgets = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
  });

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  axios
    .get(`https://appo.coinagesoft.com/api/customer-appointments/clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log("Appointments API response:", res.data.data);

      let clients = [];
      if (Array.isArray(res.data.data)) {
        clients = res.data.data;
      } else {
        console.error("Unexpected API format:", res.data);
        return;
      }

      // Unique emails
      const patientEmails = new Set(clients.map((c) => c.email).filter(Boolean));

      // Since no status field is returned, we can’t count active/completed/pending here
      setStats({
        totalPatients: patientEmails.size,
        activeAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
      });
    })
    .catch((error) =>
      console.error("Error fetching dashboard stats:", error)
    );
}, []);



  return (
    <div className="row g-6 mb-6">
      {/* Total Patients */}
      <div className="col-sm-6 col-xl-3">
        <div className="card">
          <div className="card-body mb-5">
            <div className="d-flex justify-content-between">
              <div className="me-1">
                <p className="text-heading mb-1">Total Clients</p>
                <div className="d-flex align-items-center mb-2">
                  <h4 className="mb-1 me-2">{stats.totalPatients}</h4>
                </div>
              </div>
              <div className="avatar">
                <div className="avatar-initial bg-label-primary rounded-3">
                  <i className="ri-hospital-line ri-26px"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Appointments */}
      <div className="col-sm-6 col-xl-3">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div className="me-1">
                <p className="text-heading mb-1">Active Appointments</p>
                <div className="d-flex align-items-center mb-2">
                  <h4 className="mb-1 me-1">{stats.activeAppointments}</h4>
                </div>
              </div>
              <div className="avatar">
                <div className="avatar-initial bg-label-success rounded-3">
                  <i className="ri-calendar-check-line ri-26px"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Appointments */}
      <div className="col-sm-6 col-xl-3">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div className="me-1">
                <p className="text-heading mb-1">Completed Appointments</p>
                <div className="d-flex align-items-center mb-2">
                  <h4 className="mb-1 me-1">{stats.completedAppointments}</h4>
                </div>
              </div>
              <div className="avatar">
                <div className="avatar-initial bg-label-info rounded-3">
                  <i className="ri-checkbox-circle-line ri-26px"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Appointments */}
      <div className="col-sm-6 col-xl-3">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div className="me-1">
                <p className="text-heading mb-1">Pending Appointments</p>
                <div className="d-flex align-items-center mb-2">
                  <h4 className="mb-1 me-1">{stats.pendingAppointments}</h4>
                </div>
              </div>
              <div className="avatar">
                <div className="avatar-initial bg-label-warning rounded-3">
                  <i className="ri-time-line ri-26px"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersWidgets;
