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
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [hostname, setHostname] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState(''); // coupon as string
  const [appliedCouponId, setAppliedCouponId] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');


  const planFieldsMap = {
    "Residential Vastu Consultancy": ["birthDate", "birthTime", "birthPlace", "vastuType", "googleLocation", "floorPlanFile"],
    "Commercial Vastu Consultancy": ["birthDate", "birthTime", "birthPlace", "vastuType", "googleLocation", "floorPlanFile"],
    "Industrial Vastu Consultancy": ["vastuType", "googleLocation", "floorPlanFile"],
    "Numerology Consultancy": ["birthDate", "birthTime", "birthPlace"],
    "Kundali Consultancy ": ["birthDate", "birthTime", "birthPlace"], // ✅ Kundali
  };
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // ✅ Get hostname from browser, e.g., booking.vedratnavastu.com
        const slug = window.location.hostname;
        // Send hostname as query param to backend
        const res = await fetch(
          `https://appo.coinagesoft.com/api/public-landing/all?slug=${slug}`
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
    duration: '',
    birthDate: '',        // new
    birthTime: '',        // new
    birthPlace: '',       // new
    vastuType: '',        // new
    googleLocation: '',   // new
    floorPlanFile: null,   // pre-filled plan duration as a string representing minutes (eg: "30", "60", "90")
  });
  const selectedPlanFields = planFieldsMap[formData.plan] || [];

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
  console.log("hostname", hostname)
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

      // Check if a slot from MiniCalendar is selected
  if (!formData.appointmentTime) {
    alert("Please select a time slot from the calendar before booking!");
    return; // Stop form submission
  }
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }


    setFormErrors({});

    try {
      // ✅ Get tenant slug from hostname (domain) or fallback to URL path

      // ✅ Find selected plan
      const selectedPlan = availablePlans.find(p => p.planName === formData.plan);
      if (!selectedPlan) {
        alert("Please select a valid plan.");
        return;
      }

      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "floorPlanFile" && value instanceof File) {
          formDataToSend.append("floorPlanFile", value); // File input handle
        } else {
          formDataToSend.append(key, value);
        }
      });
      if (appliedCouponId) {
        formDataToSend.append("couponId", appliedCouponId);
      }


      formDataToSend.append("planId", selectedPlan.planId);

      const response = await fetch(`https://appo.coinagesoft.com/api/public-landing/paid?slug=${hostname}`, {
        method: "POST",
        body: formDataToSend,
      });
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

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
        name: "Vedratna Vastu",
        description: "Book your appointment",
        order_id: appointment.data.orderId,
        handler: function (response) {
          console.log("💰 Payment success:", response);
          setPaymentCompleted(true);
          setIsVerifyingPayment(true);
          verifyPayment(response);
        },
        prefill: {
          name: appointment.data.name,
          email: appointment.data.email,
          contact: appointment.data.phoneNumber,
        },
      };

      const rzp1 = new window.Razorpay(razorpayOptions);
      rzp1.on("payment.failed", function () {
        setPaymentCompleted(true);
        setIsVerifyingPayment(false);
        showModal("failureModal");
      });
      rzp1.open();

    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      alert("An error occurred while booking the appointment.");
      showModal("failureModal");
    }
  };


  const applyCoupon = async () => {
    if (!couponCode) {
      alert("Please enter a coupon code.");
      return;
    }

    const selectedPlan = availablePlans.find(p => p.planName === formData.plan);
    if (!selectedPlan) {
      alert("Select a valid plan first.");
      return;
    }

    try {
      const res = await fetch(`https://appo.coinagesoft.com/api/public-landing/validate?slug=${hostname}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode, // ✅ just the string
          planId: selectedPlan.planId
        }),
      });

      const data = await res.json();

      if (data.success) {
        setAppliedCouponId(data.data.couponId || data.data.id);
        setCouponMessage(`Coupon applied! Discount: ₹${data.data.discountAmount || 0}`);
        setFormData(prev => ({
          ...prev,
          amount: Math.max(0, Number(prev.amount) - (data.data.discountAmount || 0))
        }));

      } else {
        setAppliedCouponId(null);
        setCouponMessage('');
        alert(data.message || "Invalid coupon code");
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      alert("Failed to validate coupon.");
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
        setIsVerifyingPayment(false);
        console.log('Payment Verification Result:', data);
        if (data.success && data.receipt) {
          openReceiptPdf(data.receipt);
        } else {
          alert(data.message || 'Payment verified but no receipt.');
          setIsVerifyingPayment(false);
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
          birthDate: '',        // new
          birthTime: '',        // new
          birthPlace: '',       // new
          vastuType: '',        // new
          googleLocation: '',   // new
          floorPlanFile: null,
        });
        setFormErrors({});
        setCouponMessage('');    // clear coupon message
        setCouponCode('');       // clear input
        setAppliedCouponId(null); // reset applied coupon

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


    if (!hostname) {
      console.error("Slug not found in URL or hostname");
      return;
    }

    // fetch appointments + rules + shifts using slug
    Promise.all([
      axios.get(`https://appo.coinagesoft.com/api/public-landing/customer-appointments?slug=${hostname}`),
      axios.get(`https://appo.coinagesoft.com/api/public-landing/all-rules?slug=${hostname}`),
      axios.get(`https://appo.coinagesoft.com/api/public-landing/all-shifts?slug=${hostname}`),
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

      <div className="bg-light mt-8">
        {isVerifyingPayment && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
              zIndex: 2000,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(3px)'
            }}
          >
            <div className="text-center p-4 bg-white rounded shadow">
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Verifying payment...</span>
              </div>
              <h6 className="mb-0">Verifying your payment...</h6>
            </div>
          </div>
        )}


        <div className="container row content-space-2 content-space-lg-3 mx-auto" id="target-form">
          <div className="col-lg-5 col-12 my-auto d-flex align-items-stretch mb-8  mb-lg-0">
            <div className="w-100 bg-white shadow-sm rounded  p-3 pb-5"
              style={{
                minHeight: '35.25rem',   // optional: sets a minimum height
                maxHeight: '60.25rem',   // maximum height
                height: 'auto',          // dynamic height based on content
                overflowY: 'auto',       // scroll if content exceeds maxHeight
              }}
            >
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

          <div className="col-lg-7 col-12 order-2 order-lg-1 ">
            {/* <div className="mx-auto" style={{ maxWidth: '35rem' }}> */}
            <div >
              <div className="card" ref={ref}>
                <div className="card-body contact" style={{ height: 'auto', minHeight: '35.25rem', maxHeight: '60.25rem' }}>                  <div className="text-center mb-3">
                  <h5 className="mb-1">Book Your Appointment</h5>
                  <p className="small mb-4">Please fill the details of exact person for whom consultation is needed.</p>
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
                          {formErrors.amount && <div className="text-danger small">{formErrors.amount}</div>}
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



                    {/* Vastu & Birth Details */}

                    <div className="row gx-2">

                      {(hostname === "booking.vedratnavastu.com") || (hostname === "localhost") && (
                        <>

                          {selectedPlanFields.includes("birthDate") && (
                            <div className="col-sm-6 mb-2">
                              <label className="form-label" htmlFor="birthDate">Birth Date</label>
                              <input type="date" className={`form-control form-control-sm ${formErrors.birthDate ? 'border border-danger' : ''}`}
                                name="birthDate" id="birthDate" value={formData.birthDate} onChange={handleChange} />
                              {formErrors.birthDate && <div className="text-danger small">{formErrors.birthDate}</div>}
                            </div>
                          )}

                          {selectedPlanFields.includes("birthTime") && (
                            <div className="col-sm-6 mb-2">
                              <label className="form-label" htmlFor="birthTime">Birth Time</label>
                              <input type="time" className={`form-control form-control-sm ${formErrors.birthTime ? 'border border-danger' : ''}`}
                                name="birthTime" id="birthTime" value={formData.birthTime} onChange={handleChange} />
                              {formErrors.birthTime && <div className="text-danger small">{formErrors.birthTime}</div>}
                            </div>
                          )}

                          {selectedPlanFields.includes("birthPlace") && (
                            <div className="col-sm-6 mb-2">
                              <label className="form-label" htmlFor="birthPlace">Birth Place</label>
                              <input type="text" className={`form-control form-control-sm ${formErrors.birthPlace ? 'border border-danger' : ''}`}
                                name="birthPlace" id="birthPlace" value={formData.birthPlace} onChange={handleChange} />
                              {formErrors.birthPlace && <div className="text-danger small">{formErrors.birthPlace}</div>}
                            </div>
                          )}

                          {selectedPlanFields.includes("vastuType") && (
                            <div className="col-sm-6 mb-2">
                              <label className="form-label" htmlFor="vastuType">Vastu Type</label>
                              <select className={`form-select form-select-sm ${formErrors.vastuType ? 'border border-danger' : ''}`}
                                name="vastuType" id="vastuType" value={formData.vastuType} onChange={handleChange}>
                                <option value="">-- Select Vastu Type --</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Office">Office</option>
                                <option value="Plot">Plot</option>
                              </select>
                              {formErrors.vastuType && <div className="text-danger small">{formErrors.vastuType}</div>}
                            </div>
                          )}

                          {selectedPlanFields.includes("googleLocation") && (
                            <div className="col-sm-12 mb-2">
                              <label className="form-label" htmlFor="googleLocation">Google Location</label>
                              <input type="text" className={`form-control form-control-sm ${formErrors.googleLocation ? 'border border-danger' : ''}`}
                                name="googleLocation" id="googleLocation" value={formData.googleLocation} onChange={handleChange} placeholder="Paste Google Maps link" />
                              {formErrors.googleLocation && <div className="text-danger small">{formErrors.googleLocation}</div>}
                            </div>
                          )}

                          {selectedPlanFields.includes("floorPlanFile") && (
                            <div className="col-sm-12 mb-2">
                              <label className="form-label" htmlFor="floorPlanFile">Upload Floor Plan (Optional)</label>
                              <input type="file" className="form-control form-control-sm"
                                name="floorPlanFile" id="floorPlanFile" accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setFormData({ ...formData, floorPlanFile: e.target.files[0] })} />
                            </div>
                          )}

                        </>
                      )}
                      <div className="col-sm-6">
                        <div className="mb-2">
                          <label className="form-label" htmlFor="couponCode">Coupon Code (Optional)</label>
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              id="couponCode"
                              placeholder="Enter coupon code"
                              className="form-control"
                              value={couponCode}
                              onChange={handleCouponChange}
                            />
                            <button
                              className="btn btn-primary"
                              type="button"
                              onClick={applyCoupon}
                            >
                              Apply
                            </button>
                          </div>
                          {formErrors.couponCode && (
                            <div className="text-danger small">{formErrors.couponCode}</div>
                          )}
                          {couponMessage && (
                            <div className="text-success small">{couponMessage}</div>
                          )}
                        </div>
                      </div>

                      {/* Fields visible for all tenants */}


                    </div>


                    {/* Additional Details */}
                    <div className="mb-2">
                      <label className="form-label" htmlFor="details">Details</label>
                      <textarea className="form-control form-control-sm" name="details" id="details" rows="3"
                        value={formData.details} onChange={handleChange} placeholder="Additional notes or questions..."></textarea>
                    </div>
                    <div className="d-grid mb-2">
                      <button type="submit" className="btn btn-primary btn-sm" >
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