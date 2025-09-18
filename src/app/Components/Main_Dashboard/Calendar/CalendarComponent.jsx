// src/components/CalendarComponent.jsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import {jwtDecode} from 'jwt-decode';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Calendar.css';
import AppointmentForm from './AppointmentForm';
import ShiftManager from './ShiftManager';
import { api } from '../../../../api';
import axios from 'axios';

export default function CalendarComponent() {
  const offcanvasRef = useRef(null);

  const [plans, setPlans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // selected plan/shift
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  // shifts + buffer
  const [shifts, setShifts] = useState([]);
  const [bufferInMinutes, setBufferInMinutes] = useState(0);

  // slot boundaries (Date objects)
  const [slotStartTime, setSlotStartTime] = useState(null);
  const [slotEndTime, setSlotEndTime] = useState(null);

  // users for dropdown
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const getColorClass = (index) => {
    const colors = [
      'form-check-primary',
      'form-check-success',
      'form-check-warning',
      'form-check-danger',
      'form-check-info',
      'form-check-dark',
      'form-check-light',
      'form-check-muted',
      'form-check-teal'
    ];
    return colors[index % colors.length];
  };

  // fetch appointments
const fetchAppointments = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch (e) {
    console.error('Failed to decode token', e);
    return;
  }

  const adminId = decoded.id; // or userId from token
  try {
    const url = `https://appo.coinagesoft.com/api/customer-appointments/`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json', // GET request doesn't need multipart
      },
      params: {
        userId: selectedUserId || undefined,      // send userId if selected
        adminId: selectedUserId ? undefined : adminId, // fallback to adminId if no user selected
      },
    });

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    
    // sort by appointmentDate + appointmentTime
    const sortedAppointments = data.sort(
      (a, b) =>
        new Date(a.appointmentDate + ' ' + a.appointmentTime) -
        new Date(b.appointmentDate + ' ' + b.appointmentTime)
    );

    setAppointments(sortedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    setAppointments([]);
  }
};


  useEffect(() => {
    // offcanvas hidden handler refresh
    const offcanvasElement = offcanvasRef.current;
    const handler = () => {
      setSelectedAppointment(null);
      fetchAppointments();
    };
    if (offcanvasElement) {
      offcanvasElement.addEventListener('hidden.bs.offcanvas', handler);
    }
    return () => {
      if (offcanvasElement) offcanvasElement.removeEventListener('hidden.bs.offcanvas', handler);
    };
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedUserId]);

  // fetch users for dropdown
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch plans with assigned users and admin user for dropdown
    const fetchUsersAndPlans = async () => {
      try {
        // Fetch admin user
        const decoded = jwtDecode(token);
        const currentAdminUser = { id: decoded.id, name: decoded.name || decoded.email || 'Admin' };

        // Fetch plans with users
        const plansResponse = await api.getPlansWithUsers();

        let assignedUsers = [];
        if (plansResponse && Array.isArray(plansResponse.data)) {
          plansResponse.data.forEach(plan => {
            if (plan.UserPlans && Array.isArray(plan.UserPlans)) {
              plan.UserPlans.forEach(up => {
                if (up.User) {
                  assignedUsers.push({ id: up.User.id, name: up.User.name || up.User.email });
                }
              });
            }
          });
        }

        // Remove duplicates from assignedUsers by id
        const uniqueAssignedUsersMap = new Map();
        assignedUsers.forEach(user => {
          if (!uniqueAssignedUsersMap.has(user.id)) {
            uniqueAssignedUsersMap.set(user.id, user);
          }
        });
        const uniqueAssignedUsers = Array.from(uniqueAssignedUsersMap.values());

        // Combine assigned users, exclude admin from list
        const combinedUsers = uniqueAssignedUsers.filter(u => u.id !== currentAdminUser.id);

        setUsers(combinedUsers);
      } catch (error) {
        console.error("Error fetching plans or users:", error);
        setUsers([]);
      }
    };

    fetchUsersAndPlans();
  }, []);

  // fetch plans + default selected plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const p = await api.getPlans();
        setPlans(p);
        setSelectedPlans(p.map(x => (x.planName || '').toLowerCase()));
      } catch (err) {
        console.error('Error fetching plans', err);
        setPlans([]);
      }
    };
    loadPlans();
  }, []);

  // whenever selectedPlanId changes, fetch plan-shift-rule and shift list
  useEffect(() => {
    if (!selectedPlanId) return;
    const loadShiftAndBuffer = async () => {
      try {
        // get rules
        const res = await api.getPlanShiftRules(selectedPlanId);
        const rules = res.rules ?? [];
        const rule = rules[0];
        if (rule) {
          setBufferInMinutes(rule.bufferInMinutes ?? 0);
          setSelectedShiftId(rule.shiftId);
        } else {
          setBufferInMinutes(0);
        }

        // fetch shifts
        const shiftsRes = await api.getShifts();
        // your API returns an array of shifts (startTime/endTime in HH:mm:ss)
        setShifts(Array.isArray(shiftsRes) ? shiftsRes : []);
      } catch (err) {
        console.error('Failed to load shift/rule', err);
        setShifts([]);
        setBufferInMinutes(0);
      }
    };
    loadShiftAndBuffer();
  }, [selectedPlanId]);

  // when shift list or selectedShiftId changes, compute slotStartTime/EndTime (Date objects for today)
  useEffect(() => {
    if (!shifts.length || !selectedShiftId) return;
    const shift = shifts.find(s => s.id === selectedShiftId);
    if (!shift) return;

    // convert shift.startTime ("10:00:00") into Date for today
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const start = new Date(`${dateStr}T${shift.startTime}`);
    let end = new Date(`${dateStr}T${shift.endTime}`);
    // if end <= start, treat as next day
    if (end <= start) end.setDate(end.getDate() + 1);

    setSlotStartTime(start);
    setSlotEndTime(end);
  }, [shifts, selectedShiftId]);

  // scheduledAppointments for FullCalendar
  const parseTime = (timeStr) => {
    if (!timeStr) return '00:00:00';
    // timeStr like "03:35 AM"
    const [time, modifier] = timeStr.trim().split(' ');
    const [h, m] = time.split(':').map(Number);
    let hours = h;
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  };

  const scheduledAppointments = appointments
    .filter(a => selectedPlans.includes(String(a.plan || '').toLowerCase()) &&
      (String(a.appointmentStatus).toLowerCase() === 'scheduled' || String(a.appointmentStatus).toLowerCase() === 'rescheduled' || a.appointmentStatus === 0 || a.appointmentStatus === 3))
    .map(a => {
      if (!a.appointmentDate || !a.appointmentTime) return null;
      const [startTimeStr, endTimeStr] = a.appointmentTime.split(' - ').map(s => s.trim());
      if (!startTimeStr || !endTimeStr) return null;
      const start = `${a.appointmentDate}T${parseTime(startTimeStr)}`;
      const end = `${a.appointmentDate}T${parseTime(endTimeStr)}`;
      return {
        id: a.id,
        title: `${a.firstName} ${a.lastName}`,
        start,
        end,
        className: getColorClass(plans.findIndex(p => (p.planName || '').toLowerCase() === (a.plan || '').toLowerCase())),
        extendedProps: { planName: (a.plan || '').toLowerCase(), status: a.appointmentStatus, appointmentTime: a.appointmentTime, id: a.id }
      };
    })
    .filter(Boolean);

  const handleEventClick = (info) => {
    const { title, start, extendedProps } = info.event;
    const startDateStr = start.toISOString().slice(0, 10);
    const match = appointments.find(a =>
      `${a.firstName} ${a.lastName}` === title &&
      a.appointmentDate === startDateStr &&
      a.appointmentTime === extendedProps.appointmentTime
    );
    if (match) {
      setSelectedAppointment(match);
      const offcanvasEl = document.getElementById('addEventSidebar');
      const bsOffcanvas = new window.bootstrap.Offcanvas(offcanvasEl);
      bsOffcanvas.show();
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y" style={{ backgroundColor: 'white' }}>
      <div className="card app-calendar-wrapper">
        <div className="row g-0">
          <div className="col app-calendar-sidebar border-end" id="app-calendar-sidebar">
            <div className="p-4 border-bottom">
              <button className="btn btn-primary w-100" data-bs-toggle="offcanvas" data-bs-target="#addEventSidebar" aria-controls="addEventSidebar">
                + Add Appointment
              </button>
            </div>
            <div className="px-4">
              <hr className="mb-5 mx-n4 mt-3" />
              <div className="mb-4 ms-1">
                <h5>Event Filters</h5>
              </div>

              <div className="form-check form-check-secondary mb-5 ms-3">
                <input
                  className="form-check-input select-all"
                  type="checkbox"
                  id="selectAll"
                  checked={selectedPlans.length === plans.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedPlans(plans.map(p => (p.planName || '').toLowerCase()));
                    else setSelectedPlans([]);
                  }}
                />
                <label className="form-check-label" htmlFor="selectAll">View All</label>
              </div>

              <div className="app-calendar-events-filter text-heading">
                {plans.map((plan, index) => (
                  <div className={`form-check ${getColorClass(index)} mb-3 ms-3`} key={plan.planId || index}>
                    <input
                      className="form-check-input input-filter"
                      type="checkbox"
                      id={`select-${(plan.planName || '').toLowerCase()}`}
                      checked={selectedPlans.includes((plan.planName || '').toLowerCase())}
                      onChange={(e) => {
                        const val = (plan.planName || '').toLowerCase();
                        if (e.target.checked) setSelectedPlans(prev => [...prev, val]);
                        else setSelectedPlans(prev => prev.filter(p => p !== val));
                      }}
                    />
                    <label className="form-check-label" htmlFor={`select-${(plan.planName || '').toLowerCase()}`}>
                      {plan.planName || 'Unnamed Plan'}
                    </label>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="col app-calendar-content overflow-auto ">
            <div className="d-flex justify-content-end p-2">
              <select
                className="form-select w-auto"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">All Appointments (Admin)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className=" border-0">
              <div className=" ps-0 pb-0 ">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={scheduledAppointments}
                  eventClick={handleEventClick}
                  headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                  }}
                  buttonText={{ month: 'Month', week: 'Week', day: 'Day', list: 'List' }}
                  eventContent={(info) => {
                    return { html: `<div class="custom-event ${info.event.classNames.join(' ')}">${info.event.title}</div>` };
                  }}
                />
              </div>
            </div>

            <div ref={offcanvasRef} className="offcanvas offcanvas-end" id="addEventSidebar">
              <div className="offcanvas-header border-bottom">
                <h5 className="offcanvas-title">{selectedAppointment ? 'View Appointment' : 'Add Appointment'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => setSelectedAppointment(null)}></button>
              </div>
              <div className="offcanvas-body">
                <AppointmentForm
                  plans={plans}
                  addAppointment={!selectedAppointment}
                  selectedAppointment={selectedAppointment}
                  shiftStart={slotStartTime}
                  shiftEnd={slotEndTime}
                  setSlotStartTime={setSlotStartTime}
                  setSlotEndTime={setSlotEndTime}
                  bufferInMinutes={bufferInMinutes}
                  setBufferInMinutes={setBufferInMinutes}
                  setSelectedShiftId={setSelectedShiftId}
                  selectedPlanId={selectedPlanId}
                  setSelectedPlanId={setSelectedPlanId}
                  refreshAppointments={fetchAppointments}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="row mt-4 p-4">
        <ShiftManager planId={selectedPlanId} />
      </div>
    </div>
  );
}
