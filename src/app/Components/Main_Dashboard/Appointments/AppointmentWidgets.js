'use client';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { jwtDecode } from "jwt-decode";
import {
  faCalendarAlt,
  faCheckDouble,
  faBan,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

const AppointmentWidgets = () => {
  const [appointment,setAppointments]=useState()
  const [widgetData, setWidgetData] = useState([
    {
      count: 0,
      change: '',
      label: 'Upcoming Appointments',
      subLabel: 'Scheduled visits',
      icon: faCalendarAlt,
      color: 'primary',
    },
    {
      count: 0,
      change: '',
      label: 'Completed Appointments',
      subLabel: 'Finished successfully',
      icon: faCheckDouble,
      color: 'success',
    },
    {
      count: 0,
      change: '',
      label: 'Cancelled Appointments',
      subLabel: 'Cancelled by users',
      icon: faBan,
      color: 'danger',
    },
    {
      count: 0,
      change: '',
      label: 'Failed Transactions',
      subLabel: 'Payment issues',
      icon: faExclamationTriangle,
      color: 'warning',
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    fetch(`https://appo.coinagesoft.com/api/customer-appointments/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((appointments) => {
        setAppointments(appointment)
        const today = new Date();
        
        if (!appointments?.data) return;

        // ✅ Upcoming
        const upcomingCount = appointments.data.filter((appt) => {
          const apptDate = new Date(appt.appointmentDate);
          console.log(appointments)
          return (
            apptDate >= today &&
            (appt.appointmentStatus === "Scheduled" ||
             appt.appointmentStatus === "Rescheduled")
          );
        }).length;

        // ✅ Completed
        const completedCount = appointments.data.filter(
          (appt) =>
            appt.appointmentStatus === "Completed" || appt.appointmentStatus === 1
        ).length;

        // ✅ Cancelled
        const cancelledCount = appointments.data.filter(
          (appt) =>
            appt.appointmentStatus === "Cancelled" || appt.appointmentStatus === 2
        ).length;

        // ✅ Failed Transactions
        const failedCount = appointments.data.filter(
          (appt) =>
            appt.paymentStatus === "Failed" || appt.paymentStatus === 2
        ).length;

        setWidgetData([
          {
            count: upcomingCount,
            change: '',
            label: 'Upcoming Appointments',
            subLabel: 'Scheduled visits',
            icon: faCalendarAlt,
            color: 'primary',
          },
          {
            count: completedCount,
            change: '',
            label: 'Completed Appointments',
            subLabel: 'Finished successfully',
            icon: faCheckDouble,
            color: 'success',
          },
          {
            count: cancelledCount,
            change: '',
            label: 'Cancelled Appointments',
            subLabel: 'Cancelled by users',
            icon: faBan,
            color: 'danger',
          },
          {
            count: failedCount,
            change: '',
            label: 'Failed Transactions',
            subLabel: 'Payment issues',
            icon: faExclamationTriangle,
            color: 'warning',
          },
        ]);
      })
      .catch((error) => {
        console.error('Error fetching appointments:', error);
      });
  }, [appointment]);

  return (
    <div className="row g-4 mb-4">
      {widgetData.map((widget, index) => (
        <div className="col-sm-6 col-xl-3" key={index}>
          <div className="card">
            <div className="card-body" style={{ height: '150px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="me-2">
                  <p className="text-heading mb-1">{widget.label}</p>
                  <div className="d-flex align-items-center mb-2">
                    <h4 className="mb-0 me-2">{widget.count.toLocaleString()}</h4>
                    <p className={`mb-0 text-${widget.color}`}>
                      {widget.change ? `(${widget.change})` : ''}
                    </p>
                  </div>
                </div>
                <div className="avatar">
                  <div className={`avatar-initial bg-label-${widget.color} rounded-3`}>
                    <FontAwesomeIcon icon={widget.icon} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentWidgets;
