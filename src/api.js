// src/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://appo.coinagesoft.com/api';

const client = axios.create({
  baseURL: API_BASE,
});

// attach token automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * API helpers used by the components.
 * These functions map to the API response shapes you supplied.
 */

export const api = {
  // GET /admin/shift -> returns array of shifts
  getShifts: () => client.get('/admin/shift').then(r => r.data),

  // GET /admin/plans/all -> returns array of plans
  getPlans: () => client.get('/admin/plans/all').then(r => r.data),

  // GET /admin/plans/all_plans_with_users -> returns { success: true, data: [...] }
  getPlansWithUsers: () => client.get('/admin/plans/all_plans_with_users').then(r => r.data),

  // GET /plan-shift-buffer-rule/all?planId=xxx -> returns { rules: [...] }
  getPlanShiftRules: (planId) => client.get('/plan-shift-buffer-rule/all', { params: { planId } }).then(r => r.data),

  // GET /customer-appointments/admin/:adminId -> returns { success: true, data: [...] }
  getAdminAppointments: (adminId) => client.get(`/customer-appointments/admin/${adminId}`).then(r => r.data),

  // GET booked slots for date -> expected to return an array of booked slots
  // (Your AppointmentForm used /customer-appointments/booked-slots/:date)
  getBookedSlotsByDate: (date, planId) => client.get(`/customer-appointments/booked-slots/${date}`, { params: { planId } }).then(r => r.data),

  // POST new appointment
  postAppointmentFree: (body) => client.post('/customer-appointments/free', body).then(r => r.data),

  // Create / update / delete shift
  createShift: (body) => client.post('/admin/shift', body).then(r => r.data),
  updateShift: (id, body) => client.put(`/admin/shift/${id}`, body).then(r => r.data),
  deleteShift: (id) => client.delete(`/admin/shift/${id}`).then(r => r.data),
};
