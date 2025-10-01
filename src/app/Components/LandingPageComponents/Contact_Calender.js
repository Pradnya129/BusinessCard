'use client';
import React, { Children, forwardRef, useEffect, useState } from 'react';
import 'react-time-picker/dist/TimePicker.css';
import MiniCalendar from './MiniCalendar';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


const TimePicker = dynamic(() => import('react-time-picker'), { ssr: false });

const Contact_Calender = React.forwardRef((props, ref) => {
  const [formErrors, setFormErrors] = useState({});
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

useEffect(() => {
  const fetchPlans = async () => {
    try {
      // ✅ Get hostname from browser, e.g., booking.vedratnavastu.com
      const hostname = window.location.hostname;

      // Send hostname as query param to backend
      const res = await fetch(
        `https://appo.coinagesoft.com/api/public-landing/all?slug=${hostname}`
      );

      if (!res.ok) throw new Error("Failed to fetch plans");

      const obj = await res.json();
      const data = obj.data;

      console.log("Plans Data:", data);

      if (Array.isArray(data) && data.length > 0) {
        setAvailablePlans(data);

        // Auto-select the first plan
        const firstPlan = data[0];
        setFormData(prev => ({
          ...prev,
          plan: firstPlan.planName,
          amount: firstPlan.planPrice,
          duration: firstPlan.planDuration,
          appointmentTime: ''
        }));
      }
    } catch (err) {
      console.error("Error fetching plans", err);
    }
  };

  fetchPlans();
}, []);



  const API_URL = process.env.REACT_APP_API_URL;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    details: '',
    appointmentDate: '',  // will be in yyyy-mm-dd format from input type date
    appointmentTime: '',
    plan: '', // pre-filled plan name
    amount: '',     // pre-filled plan price
    duration: '',   // pre-filled plan duration as a string representing minutes (eg: "30", "60", "90")
  });

  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (!formData.appointmentDate) errors.appointmentDate = 'Please select a date';
    if (!formData.appointmentTime) errors.appointmentTime = 'Please select a time slot';
    if (!formData.plan.trim()) errors.plan = 'Plan is required';
    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(formData.amount)) {
      errors.amount = 'Amount must be a number';
    } else if (Number(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!formData.duration.trim()) errors.duration = 'Duration is required';
    return errors;
  };

  // Prefill plan, amount, and duration if provided via props
  useEffect(() => {
    if (props.prefillData) {
      setFormData((prev) => ({
        ...prev,
        plan: props.prefillData.planName || '',
        amount: props.prefillData.planPrice || '',
        duration: props.prefillData.planDuration || '',
      }));
    }
  }, [props.prefillData]);

  const showModal = (modalId) => {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  // Utility to generate slots
function generateSlots(startTime, endTime, durationMinutes, bufferMinutes, booked = []) {
  const slots = [];
  let [startHour, startMin] = startTime.split(":").map(Number);
  let [endHour, endMin] = endTime.split(":").map(Number);

  let start = new Date();
  start.setHours(startHour, startMin, 0, 0);

  let end = new Date();
  end.setHours(endHour, endMin, 0, 0);

  while (start.getTime() + durationMinutes * 60000 <= end.getTime()) {
    const slotStart = new Date(start);
    const slotEnd = new Date(start.getTime() + durationMinutes * 60000);

    const formattedStart = slotStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedEnd = slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const slotLabel = `${formattedStart} - ${formattedEnd}`;

    // only add if not booked
    if (!booked.includes(formattedStart)) {
      slots.push(formattedStart); // or slotLabel if you want range display
    }

    // move pointer (duration + buffer)
    start = new Date(start.getTime() + (durationMinutes + bufferMinutes) * 60000);
  }

  return slots;
}

  // Use a native date input so user can select any date
  // We'll keep the date in "yyyy-mm-dd" format from the input,
  // then format it when needed for display.
  const handleDateSelect = (e) => {
    const selectedDate = e.target.value; // this is in yyyy-mm-dd format
    // Optional: block past dates
    const today = new Date().toISOString().split('T')[0];
       
    if (selectedDate < today) {
      alert("Please select a future date.");
      return;
    }
    // Save the raw date string (or format it later for display)
    setFormData({ ...formData, appointmentDate: selectedDate, appointmentTime: '' });

    setBookedTimeSlots([]);
  };

  // Format a date in dd-mm-yyyy for display purposes
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }
  setFormErrors({});

  try {
    // ✅ Get tenant slug from hostname (domain) or fallback to URL path
    let slug = window.location.hostname; // e.g., booking.vedratnavastu.com

    // ✅ Find selected plan
    const selectedPlan = availablePlans.find(p => p.planName === formData.plan);
    if (!selectedPlan) {
      alert("Please select a valid plan.");
      return;
    }

    // ✅ Construct request body
    const payload = {
      ...formData,
      slug,              // send slug to backend
      planId: selectedPlan.planId
    };

    console.log("📤 Sending appointment payload:", payload);

    const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const appointment = await response.json();
    console.log("✅ Appointment created:", appointment);

    // 🛠️ Razorpay integration
    const razorpayOptions = {
      key: appointment.data.razorpayKey,
      amount: appointment.data.amount,
      currency: "INR",
      name: "Aura Enterprises",
      description: "Book your appointment",
      order_id: appointment.data.orderId,
      handler: function (response) {
        console.log("💰 Payment success:", response);
        setPaymentCompleted(true);
        verifyPayment(response);
      },
      prefill: {
        name: appointment.data.name,
        email: appointment.data.email,
        contact: appointment.data.phoneNumber,
      },
    };

    const rzp1 = new window.Razorpay(razorpayOptions);
    setLoadingPayment(true);
    rzp1.on("payment.failed", function () {
      setLoadingPayment(false);
      setPaymentCompleted(true);
      showModal("failureModal");
    });
    rzp1.open();

  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    alert("An error occurred while booking the appointment.");
    showModal("failureModal");
  }
};



  function openReceiptPdf(base64Pdf) {
    const byteCharacters = atob(base64Pdf);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    window.open(blobUrl, '_blank'); // open in new tab
  }
  function downloadPdf(base64Pdf) {
    const byteCharacters = atob(base64Pdf);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Appointment-Receipt.pdf`;
    link.click();
  }


  const verifyPayment = async (paymentResponse) => {
    try {
      const response = await fetch(`https://appo.coinagesoft.com/api/customer-appointments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  orderId: paymentResponse.razorpay_order_id,
  paymentId: paymentResponse.razorpay_payment_id,
  signature: paymentResponse.razorpay_signature
})
        
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Payment Verification Result:', data);
        if (data.success && data.receipt) {
          openReceiptPdf(data.receipt);
        } else {
          alert(data.message || 'Payment verified but no receipt.');
        }

        showModal('successModal');
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
        });
        setFormErrors({});
      } else {
        const errorText = await response.text();
        console.error('Verification failed:', errorText);
        showModal('failureModal');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('An error occurred while verifying the payment.');
    }

    setTimeout(() => {
      const modalElement = document.getElementById('successModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }
    }, 3000);
  };

useEffect(() => { 
  if (!formData.appointmentDate || !formData.plan) return;

  // ✅ Get slug from hostname first, fallback to URL path (for localhost/testing)
  let slug = window.location.hostname; // e.g., booking.vedratnavastu.com


  if (!slug) {
    console.error("Slug not found in URL or hostname");
    return;
  }

  // fetch appointments + rules + shifts using slug
  Promise.all([
    axios.get(`https://appo.coinagesoft.com/api/public-landing/customer-appointments?slug=${slug}`),
    axios.get(`https://appo.coinagesoft.com/api/public-landing/all-rules?slug=${slug}`),
    axios.get(`https://appo.coinagesoft.com/api/public-landing/all-shifts?slug=${slug}`),
  ])
    .then(([appointmentsRes, rulesRes, shiftsRes]) => {
      const appointments = appointmentsRes.data?.data || [];
      const rules = rulesRes.data?.rules || [];
      const shifts = shiftsRes.data?.data || [];

      // find selected plan
      const selectedPlan = availablePlans.find((p) => p.planName === formData.plan);
      if (!selectedPlan) return;

      // find buffer + shiftId for plan
      const rule = rules.find((r) => r.planId === selectedPlan.planId);
      if (!rule) return;

      const shift = shifts.find((s) => s.id === rule.shiftId);
      if (!shift) return;

      // collect booked slots for this date
      const booked = appointments
        .filter((a) => a.appointmentDate === formData.appointmentDate)
        .map((a) => a.appointmentTime);

      setBookedTimeSlots(booked);

      // generate available slots
      const slots = generateSlots(
        shift.startTime,                    // e.g., "10:00:00"
        shift.endTime,                      // e.g., "22:00:00"
        Number(selectedPlan.planDuration),  // plan duration in minutes
        Number(rule.bufferInMinutes),       // buffer in minutes
        booked
      );

      setAvailableSlots(slots);
    })
    .catch((err) => console.error("Error fetching slots:", err));
}, [formData.appointmentDate, formData.plan, availablePlans]);



  return (
    <>
      {loadingPayment && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center" style={{ zIndex: 9999 }}>
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Processing payment...</span>
          </div>
        </div>
      )}
      <div className="bg-light mt-8">
        <div className="container row content-space-2 content-space-lg-3 mx-auto" id="target-form">
          <div className="col-lg-7 col-12 ">
            {/* <div className="mx-auto" style={{ maxWidth: '35rem' }}> */}
            <div >
              <div className="card" ref={ref}>
                <div className="card-body contact" style={{ maxHeight: '60.25rem', minHeight: '35.25rem' }}>
                  <div className="text-center mb-3">
                    <h5 className="mb-1">Book Your Appointment</h5>
                    <p className="small mb-4">Please provide your details and let us know how we can assist you.</p>
                    <hr className='bg-dark' />
                  </div>
                  <form onSubmit={handleSubmit}>
                    {/* First and Last Name */}
                    <div className="row gx-2">
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="firstName">First name</label>
                          <input type="text" className={`form-control form-control-sm ${formErrors.firstName ? 'border border-danger' : ''}`}
                            name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter your first name" />
                          {formErrors.firstName && <div className="text-danger small">{formErrors.firstName}</div>}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="lastName">Last name</label>
                          <input type="text" className={`form-control form-control-sm ${formErrors.lastName ? 'border border-danger' : ''}`}
                            name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter your last name" />
                          {formErrors.lastName && <div className="text-danger small">{formErrors.lastName}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Email and Phone */}
                    <div className="row gx-2">
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="email">Email</label>
                          <input type="email" className={`form-control form-control-sm ${formErrors.email ? 'border border-danger' : ''}`}
                            name="email" id="email" value={formData.email} onChange={handleChange} placeholder="Enter your email address" />
                          {formErrors.email && <div className="text-danger small">{formErrors.email}</div>}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="phoneNumber">Phone</label>
                          <input type="text" className={`form-control form-control-sm ${formErrors.phoneNumber ? 'border border-danger' : ''}`}
                            name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Enter your phone number" />
                          {formErrors.phoneNumber && <div className="text-danger small">{formErrors.phoneNumber}</div>}
                        </div>
                      </div>
                    </div>


                    {/* Date & Time Slot */}
                    <div className="row gx-2">
                      <div className='col-sm-6'>
                        <div className="mb-2">
                          <label className="form-label" htmlFor="planDropdown">Choose a Plan</label>
                          <select
                            id="planDropdown"
                            className="form-select form-select-sm"
                            value={formData.plan}
                            onChange={(e) => {
                              const selectedPlan = availablePlans.find(p => p.planName === e.target.value);
                              if (selectedPlan) {
                                setFormData(prev => ({
                                  ...prev,
                                  plan: selectedPlan.planName,
                                  amount: selectedPlan.planPrice,
                                  duration: selectedPlan.planDuration,
                                  appointmentTime: "", // reset previously selected slot
                                }));
                              }
                            }}
                          >
                            <option value="">-- Select a Plan --</option>
                            {availablePlans.map(plan => (
                              <option key={plan.planId} value={plan.planName}>
                                {plan.planName} - ₹{plan.planPrice}
                              </option>
                            ))}
                          </select>
                          {formErrors.plan && <div className="text-danger small">{formErrors.plan}</div>}
                        </div>
                      </div>
                      <div className="col-sm-6 ">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="appointmentDate">Choose a Date</label>
                          <input type="date" className={`form-control form-control-sm ${formErrors.appointmentDate ? 'border border-danger' : ''}`}
                            name="appointmentDate" id="appointmentDate" value={formData.appointmentDate} onChange={handleDateSelect} />
                          {formErrors.appointmentDate && <div className="text-danger small">{formErrors.appointmentDate}</div>}
                        </div>
                        {formData.appointmentDate && (
                          <div className="mb-2">
                            <p className="small">
                              Selected Date: {formatDateDisplay(formData.appointmentDate)}
                            </p>
                          </div>
                        )}


                      </div>

                    </div>
                    {/* Price & Duration */}
                    <div className="row gx-2">
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="amount">Plan Price</label>
                          <input type="text" className={`form-control form-control-sm ${formErrors.amount ? 'border border-danger' : ''}`}
                            name="amount" id="amount" value={formData.amount} readOnly placeholder="Auto-filled" />
                          {formErrors.price && <div className="text-danger small">{formErrors.price}</div>}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="duration">Plan Duration (Minutes)</label>
                          <input type="text" className={`form-control form-control-sm ${formErrors.duration ? 'border border-danger' : ''}`}
                            name="duration" id="duration" value={formData.duration} readOnly placeholder="Auto-filled" />
                          {formErrors.duration && <div className="text-danger small">{formErrors.duration}</div>}
                        </div>
                      </div>
                    </div>
                    {/* Additional Details */}
                    <div className="mb-2">
                      <label className="form-label" htmlFor="details">Details</label>
                      <textarea className="form-control form-control-sm" name="details" id="details" rows="3"
                        value={formData.details} onChange={handleChange} placeholder="Additional notes or questions..."></textarea>
                    </div>
                    <div className="d-grid mb-2">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={loadingPayment}>
                        Book Appointment
                      </button>
                    </div>
                    <div className="text-center">
                      {/* <p className="form-text text-muted small">We&apos;ll respond in 1–2 business days.</p> */}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        <div className="col-lg-5 col-12 my-auto d-flex align-items-stretch">
  <div className="w-100 bg-white shadow-sm rounded p-3" style={{ minHeight: '35.25rem', maxHeight: '60.25rem' }}>
    <div className="text-center mb-3">
      <h5 className="mb-1">Choose Your Slot</h5>
      <p className="small mb-3">Select a date and time</p>
      <hr className="bg-dark" />
    </div>

    <MiniCalendar
      selected={formData.appointmentDate}
      duration={formData.duration}
      bookedTimeSlots={bookedTimeSlots}
      availableSlots={availableSlots}
      onDateChange={(date) => {
        setFormData(prev => ({
          ...prev,
          appointmentDate: date,
          appointmentTime: ''
        }));
      }}
      onSlotSelect={(slot) => {
        setFormData(prev => ({
          ...prev,
          appointmentTime: slot
        }));
      }}
      selectedSlot={formData.appointmentTime}
      planId={availablePlans.find(p => p.planName === formData.plan)?.planId}
    />
  </div>
</div>

        </div>
      </div>
      {/* Modals for Success, Failure, and Cancel */}
      <div className="modal fade" id="successModal" tabIndex="-1" aria-labelledby="successModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-body text-center p-5 bg-success bg-opacity-10">
              <div className="text-success mb-3">
                <i className="fas fa-check-circle fa-3x"></i>
              </div>
              <h4 className="mb-2">Appointment Confirmed!</h4>
              <p className="mb-3">Your payment was successful. We&apos;ll get in touch soon.</p>
              <button type="button" className="btn btn-outline-success" data-bs-dismiss="modal">Okay</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="failureModal" tabIndex="-1" aria-labelledby="failureModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-body text-center p-5 bg-danger bg-opacity-10">
              <div className="text-danger mb-3">
                <i className="fas fa-times-circle fa-3x"></i>
              </div>
              <h4 className="mb-2">Payment Failed</h4>
              <p className="mb-3">Something went wrong. Please try again later.</p>
              <button type="button" className="btn btn-outline-danger" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="cancelModal" tabIndex="-1" aria-labelledby="cancelModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header">
              <h5 className="modal-title w-100" id="cancelModalLabel">Payment Cancelled</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              You cancelled the payment process. If this was a mistake, you can try again.
            </div>
            <div className="modal-footer justify-content-center">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

Contact_Calender.displayName = "Contact_Calender";

export default Contact_Calender;