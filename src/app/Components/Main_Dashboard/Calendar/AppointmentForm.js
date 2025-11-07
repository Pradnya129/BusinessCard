'use client';
import React, { useEffect, useState } from 'react';
import validator from 'validator';
import { api } from '../../../../api';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function AppointmentForm({
  plans,
  addAppointment,
  selectedAppointment,
  setSlotStartTime,
  setSlotEndTime,
  setBufferInMinutes,
  setSelectedShiftId,
  selectedPlanId,
  setSelectedPlanId,
  refreshAppointments,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    details: '',
    appointmentDate: '',
    appointmentTime: '',
    plan: '',
    amount: '',
    duration: '',
    bufferInMinutes: 0,
  });

  const [errors, setErrors] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ==================== Helper Functions ====================
  const parse12ToDate = (timeStr, baseDate) => {
    if (!timeStr) return null;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const format12 = (date) => {
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  };

  const isOverlapping = (s1, e1, s2, e2) => s1 < e2 && s2 < e1;

  const generateTimeSlots = (shiftStart, shiftEnd, durationMin, bufferMin) => {
    if (!shiftStart || !shiftEnd || !durationMin || durationMin <= 0) return [];
    const slots = [];
    let cur = new Date(shiftStart);
    while (true) {
      const slotEnd = new Date(cur.getTime() + durationMin * 60000);
      if (slotEnd > shiftEnd) break;
      slots.push({
        label: `${format12(cur)} - ${format12(slotEnd)}`,
        start: format12(cur),
        end: format12(slotEnd),
      });
      cur = new Date(slotEnd.getTime() + (bufferMin || 0) * 60000);
    }
    return slots;
  };

  // ==================== Load/Edit Data ====================
  useEffect(() => {
    if (!addAppointment && selectedAppointment) {
      setFormData({
        firstName: selectedAppointment.firstName || '',
        lastName: selectedAppointment.lastName || '',
        email: selectedAppointment.email || '',
        phoneNumber: selectedAppointment.phoneNumber || '',
        details: selectedAppointment.details || '',
        appointmentDate: selectedAppointment.appointmentDate || '',
        appointmentTime: selectedAppointment.appointmentTime || '',
        plan: selectedAppointment.plan || '',
        amount: selectedAppointment.amount || '',
        duration: selectedAppointment.duration || '',
        bufferInMinutes: selectedAppointment.bufferInMinutes || 0,
      });
    } else if (addAppointment) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        details: '',
        appointmentDate: '',
        appointmentTime: '',
        plan: '',
        amount: '',
        duration: '',
        bufferInMinutes: 0,
      });
      setTimeSlots([]);
      setBookedTimeSlots([]);
    }
  }, [selectedAppointment, addAppointment]);

  // ==================== Fetch Shift + Slots + Buffer ====================
  const fetchShiftAndSlots = async (planId, selectedDate, duration) => {
    if (!selectedDate || !duration || !planId) {
      setTimeSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
const slug = window.location.hostname;
      const baseDate = new Date(selectedDate);

      // 1️⃣ Fetch rule (contains buffer + shift)
      const ruleRes = await axios.get(
        `https://appo.coinagesoft.com/api/public-landing/all-rules?slug=${slug}`
      );
      const rule = ruleRes.data.rules.find((r) => r.planId === planId);
      console.log("appo rule",rule)
      if (!rule) {
        setLoadingSlots(false);
        return;
      }

      // Update buffer values everywhere
      setBufferInMinutes(rule.bufferInMinutes || 0);
      setFormData((prev) => ({
        ...prev,
        bufferInMinutes: rule.bufferInMinutes || 0,
      }));

      // 2️⃣ Fetch shift
      const shiftRes = await axios.get(
        `https://appo.coinagesoft.com/api/public-landing/all-shifts?slug=${slug}`
      );
      const shift = shiftRes.data.data.find((s) => s.id === rule.shiftId);
      if (!shift) {
        setLoadingSlots(false);
        return;
      }

      const shiftStart = new Date(`${selectedDate}T${shift.startTime}`);
      const shiftEnd = new Date(`${selectedDate}T${shift.endTime}`);
      const slots = generateTimeSlots(
        shiftStart,
        shiftEnd,
        Number(duration),
        rule.bufferInMinutes
      );

      // 3️⃣ Fetch assigned users
     const usersRes = await axios.get(
           `https://appo.coinagesoft.com/api/public-landing/allUsersByPlan`,
           { params: { slug, planId } }
         );
         const users = usersRes.data?.data || [];
         console.log("Users assigned to this plan:", users);
   
         if (!users.length) {
            console.log("no user")

           setTimeSlots(slots); // no users, all slots are free
           return;
         }

      // 4️⃣ Fetch booked slots for each user
      const dateStr = baseDate.toISOString().split('T')[0];
     const bookedResults = await Promise.all(
  users.map(async (user) => {
    try {
      // use baseDate, not undefined "selected"
      const dateStr = baseDate.toISOString().split("T")[0];

      const res = await axios.get(
        `https://appo.coinagesoft.com/api/public-landing/booked-slots/${dateStr}`,
        { params: { userId: user.id, planId, slug } }
      );
      console.log("boo",user.id)
      return res.data?.data || [];
    } catch (err) {
      console.error(`Error fetching booked slots for user ${user.id}`, err);
      return [];
    }
  })
);
console.log("bokked r",bookedResults)


  
      const allBooked = bookedResults.flat();

    // convert to Date ranges
const bookedRanges = allBooked
  .filter(b => b.startTime && b.endTime) // safety check
  .map(b => ({
    start: parse12ToDate(b.startTime, baseDate),
    end: parse12ToDate(b.endTime, baseDate),
  }));

// ✅ Convert slot.start/end strings to Date before comparing
const finalSlots = slots.map(slot => {
  const slotStart = parse12ToDate(slot.start, baseDate);
  const slotEnd = parse12ToDate(slot.end, baseDate);

  const isBooked = bookedRanges.some(b =>
    b.start.getTime() === slotStart.getTime() && b.end.getTime() === slotEnd.getTime()
  );

  return { ...slot, isBooked };
});

      setBookedTimeSlots(allBooked);

      // 5️⃣ Mark booked slots visually
   

      setTimeSlots(finalSlots);
      setSelectedShiftId(rule.shiftId);
      setSlotStartTime(shiftStart);
      setSlotEndTime(shiftEnd);
    } catch (err) {
      console.error('❌ Error fetching slots:', err);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // ==================== Plan Change ====================
  const handlePlanChange = async (e) => {
    const planName = e.target.value;
    const selectedPlan = plans.find((p) => p.planName === planName);
    if (!selectedPlan) return;

    setFormData((prev) => ({
      ...prev,
      plan: selectedPlan.planName,
      amount: selectedPlan.planPrice,
      duration: selectedPlan.planDuration,
      bufferInMinutes: 0,
      appointmentTime: '',
    }));

    setSelectedPlanId(selectedPlan.planId);
    await fetchShiftAndSlots(
      selectedPlan.planId,
      formData.appointmentDate,
      selectedPlan.planDuration
    );
  };

  // Trigger on date or plan change
  useEffect(() => {
    if (selectedPlanId && formData.appointmentDate && formData.duration) {
      fetchShiftAndSlots(selectedPlanId, formData.appointmentDate, formData.duration);
    }
  }, [selectedPlanId, formData.appointmentDate]);

  // ==================== Form Handlers ====================
  const handleDateSelect = (e) => {
    const selectedDate = e.target.value;
    setFormData((prev) => ({ ...prev, appointmentDate: selectedDate, appointmentTime: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==================== Validation ====================
  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!validator.isEmail(formData.email || '')) errs.email = 'Invalid email';
    if (!/^\d{10}$/.test(formData.phoneNumber || ''))
      errs.phoneNumber = 'Must be 10 digits';
    if (!formData.plan) errs.plan = 'Plan is required';
    if (!formData.appointmentDate) errs.appointmentDate = 'Date is required';
    if (!formData.appointmentTime) errs.appointmentTime = 'Time is required';
    return errs;
  };

  // ==================== Submit ====================
const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found");
      return;
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.id;
    const planId = selectedPlanId || formData.planId;

    if (!planId) {
      console.error("❌ planId missing");
      return;
    }

    // 🟢 userId removed (backend gets it internally)
    const body = {
      ...formData,
      adminId,
      planId,
    };

    await axios.post(
      "https://appo.coinagesoft.com/api/customer-appointments/free",
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // ✅ Refresh appointments
    if (typeof refreshAppointments === "function") refreshAppointments();

    // ✅ Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      details: "",
      appointmentDate: "",
      appointmentTime: "",
      plan: "",
      amount: "",
      duration: "",
      bufferInMinutes: 0,
    });

    const offcanvasEl = document.getElementById("addEventSidebar");
    alert("✅ Appointment booked successfully!");
    if (offcanvasEl) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }
  } catch (err) {
    console.error("Booking failed", err);
    alert("❌ Failed to book appointment. Please try again.");
  }
};




  const handleTimeSelect = (value) => {
    setFormData((prev) => ({ ...prev, appointmentTime: value }));
  };

  // ==================== JSX ====================
  return (
    <>
      <form onSubmit={handleSubmit} className="container py-3" style={{ maxWidth: 600 }}>
        {/* BASIC INPUTS */}
        {['firstName', 'lastName', 'email', 'phoneNumber'].map((field) => (
          <div key={field} className="mb-3">
            <label className="form-label">
              {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
            </label>
            <input
              type={field === 'email' ? 'email' : field === 'phoneNumber' ? 'tel' : 'text'}
              name={field}
              className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
              value={formData[field]}
              onChange={handleInputChange}
            />
            {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
          </div>
        ))}

        {/* Details */}
        <div className="mb-3">
          <label className="form-label">Details</label>
          <textarea
            name="details"
            className="form-control"
            rows="3"
            value={formData.details}
            onChange={handleInputChange}
          />
        </div>

        {/* Plan */}
        <div className="mb-3">
          <label className="form-label">Plan</label>
          <select
            name="plan"
            className={`form-select ${errors.plan ? 'is-invalid' : ''}`}
            value={formData.plan}
            onChange={handlePlanChange}
          >
            <option value="">Select a Plan</option>
            {plans.map((p) => (
              <option key={p.planId} value={p.planName}>
                {p.planName}
              </option>
            ))}
          </select>
          {errors.plan && <div className="invalid-feedback">{errors.plan}</div>}
        </div>

        {/* Duration */}
        <div className="mb-3">
          <label className="form-label">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            className="form-control"
            value={formData.duration}
            disabled
          />
        </div>

        {/* Buffer */}
        <div className="mb-3">
          <label className="form-label">Buffer (minutes)</label>
          <input
            type="number"
            name="bufferInMinutes"
            className="form-control"
            value={formData.bufferInMinutes}
            disabled
          />
        </div>

        {/* Appointment Date */}
        <div className="mb-3">
          <label className="form-label">Appointment Date</label>
          <input
            type="date"
            name="appointmentDate"
            className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
            value={formData.appointmentDate}
            onChange={handleDateSelect}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.appointmentDate && (
            <div className="invalid-feedback">{errors.appointmentDate}</div>
          )}
        </div>

        {/* Slots */}
        {formData.appointmentDate && (
          <div className="mb-3">
            <label className="form-label">
              Available Slots (Buffer: {formData.bufferInMinutes || 0} min)
            </label>
            <div className="d-flex flex-wrap gap-2">
              {loadingSlots ? (
                <div className="text-muted">Loading slots...</div>
              ) : timeSlots.length === 0 ? (
                <div className="text-muted">No slots available.</div>
              ) : (
                timeSlots.map((slot, idx) => {
                  const booked = slot.isBooked;
                  const selected = formData.appointmentTime === slot.label;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`btn btn-sm ${
                        booked
                          ? 'btn-danger'
                          : selected
                          ? 'btn-primary'
                          : 'btn-outline-primary'
                      }`}
                      disabled={booked}
                      onClick={() => handleTimeSelect(slot.label)}
                    >
                      {slot.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {addAppointment && (
          <button type="submit" className="btn btn-success w-100">
            Add Appointment
          </button>
        )}



      </form>
    </>
  );
}
