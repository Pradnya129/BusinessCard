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
  
    const decoded = jwtDecode(token);
    const adminId = decoded.id; 
  axios.get(`https://appo.coinagesoft.com/api/customer-appointments/admin/${adminId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((data) => {
      console.log("Appointments API response:", data.data.data);

      // ✅ Extract appointments correctly
      let appointments = [];
      if (Array.isArray(data)) {
        appointments = data; // already an array
      } else if (Array.isArray(data.appointments)) {
        appointments = data.appointments; // nested inside "appointments"
      } else if (Array.isArray(data.data.data)) {
        appointments = data.data.data; // nested inside "data"
      } else {
        console.error("Unexpected API format:", data);
        return;
      }

      const patientEmails = new Set();
      let active = 0, completed = 0, pending = 0;

      appointments.forEach((appointment) => {
        const status = appointment.appointmentStatus;

        if (appointment.email) {
          patientEmails.add(appointment.email);
        }

        // adjust these based on your backend's status codes
        if (status === 0) {
          active++;
        } else if (status === 1) {
          completed++;
        } else if (status === 4) {
          pending++;
        }
      });

      setStats({
        totalPatients: patientEmails.size,
        activeAppointments: active,
        completedAppointments: completed,
        pendingAppointments: pending,
      });
    })
    .catch((error) => console.error("Error fetching dashboard stats:", error));
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
