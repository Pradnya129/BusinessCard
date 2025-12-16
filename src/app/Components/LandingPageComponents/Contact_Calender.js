'use client';
import React, { Children, forwardRef, useEffect, useState } from 'react';
import 'react-time-picker/dist/TimePicker.css';
import MiniCalendar from './MiniCalendar';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";


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
  const [showCouponField, setShowCouponField] = useState(false);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const router = useRouter();
  const [hover, setHover] = useState(false);


  const planFieldsMap = {
    "Residential Vastu Consultancy": ["birthDate", "birthTime", "birthPlace", "googleLocation", "floorPlanFile"],
    "Commercial Vastu Consultancy": ["birthDate", "birthTime", "birthPlace", "googleLocation", "floorPlanFile"],
    "Online Vastu Plan Consultation": ["birthDate", "birthTime", "birthPlace", "vastuType", "googleLocation", "floorPlanFile"],
    "Industrial Vastu Consultancy": ["vastuType", "googleLocation", "floorPlanFile"],
    "Numerology Consultancy": ["birthDate", "birthTime", "birthPlace"],
    "Kundali Consultancy ": ["birthDate", "birthTime", "birthPlace"], // ✅ Kundali
  };
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname; // "www.appointify.me" or "www.aura-enterprises.in"
      const pathname = window.location.pathname; // "/aura-enterprises" or "/"

      // Determine slug
      let slug = "";

      // If main domain
      if (hostname.includes("www.appointify.me") || hostname.includes("localhost")) {
        slug = pathname.split("/")[1]; // get slug from URL path
        console.log("slug/", slug)
      } else {
        // Custom domain → send hostname as slug
        slug = hostname;
      }
      setHostname(slug);
    }
  }, []);
  useEffect(() => {
    console.log("prefillData", props.prefillData)
    if (!props.prefillData) return;

    const { planId, planName, planPrice, planDuration, selectedDate, selectedSlot } = props.prefillData;

    setFormData(prev => ({
      ...prev,
      plan: planName || prev.plan,
      amount: planPrice || prev.amount,
      duration: planDuration || prev.duration,
      appointmentDate: selectedDate || prev.appointmentDate,
      appointmentTime: selectedSlot || prev.appointmentTime,
    }));
  }, [props.prefillData]);


  const fetchCouponSetting = async () => {
    try {
      const hostname = window.location.hostname; // "www.appointify.me" or "www.aura-enterprises.in"
      const pathname = window.location.pathname; // "/aura-enterprises" or "/"

      // Determine slug
      let slug = "";

      // If main domain
      if (hostname.includes("www.appointify.me") || hostname.includes("localhost")) {
        slug = pathname.split("/")[1]; // get slug from URL path
        console.log("slug/", slug)
      } else {
        // Custom domain → send hostname as slug
        slug = hostname;
      }
      const res = await fetch(`https://appo.coinagesoft.com/api/public-landing/coupon-visibility?slug=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch coupon setting");
      const data = await res.json();
      setShowCouponField(data?.showCouponField);
      console.log("res", data?.showCouponField)
    } catch (err) {
      console.error("Error fetching coupon setting:", err);
    }
  };

  fetchCouponSetting();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // ✅ Get hostname from browser, e.g., booking.vedratnavastu.com
        const hostname = window.location.hostname; // "www.appointify.me" or "www.aura-enterprises.in"
        const pathname = window.location.pathname; // "/aura-enterprises" or "/"

        // Determine slug
        let slug = "";

        // If main domain
        if (hostname.includes("www.appointify.me") || hostname.includes("localhost")) {
          slug = pathname.split("/")[1]; // get slug from URL path
          console.log("slug/", slug)
        } else {
          // Custom domain → send hostname as slug
          slug = hostname;
        }        // Send hostname as query param to backend
        const res = await fetch(
          `https://appo.coinagesoft.com/api/public-landing/all?slug=${slug}`
        );

        if (!res.ok) throw new Error("Failed to fetch plans");

        const obj = await res.json();
        const data = obj.data;

        console.log("Plans Data:", data);

        if (Array.isArray(data) && data.length > 0) {
          setAvailablePlans(data);


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
      const slugInfo = await fetch(
        `https://appo.coinagesoft.com/api/public-landing/slug?slug=${hostname}`
      );
      const slugData = await slugInfo.json();

      // Extract business name
      const businessName = slugData?.admin?.businessName || "Business";


      console.log("Business Name:", businessName);
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
        name: businessName,
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
          // alert(data.message || 'Payment verified but no receipt.');
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
      // alert('An error occurred while verifying the payment.');
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




    if (!hostname) {
      console.log("hostname")
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
        console.log("rules", rules);
        console.log("shifts", shifts)
        const selectedPlan = availablePlans.find((p) => p.planName === formData.plan);
        console.log("selected plan", selectedPlan)
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
        console.log("shift start time", shift.startTime);
        console.log("shift end time", shift.endTime)
        // generate available slots
        const slots = generateSlots(
          shift.startTime,                    // e.g., "10:00:00"
          shift.endTime,                      // e.g., "22:00:00"
          Number(selectedPlan.planDuration),  // plan duration in minutes
          Number(rule.bufferInMinutes),       // buffer in minutes
          booked
        );

        setAvailableSlots(slots);
        console.log("slots", slots)
      })
      .catch((err) => console.error("Error fetching slots:", err));
  }, [formData.appointmentDate, formData.plan, availablePlans]);



  return (
    <>

      <div className="bg-light pt-8">
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

        <div className="container mb-5 ">
          <div className="col-lg-12 col-12 d-flex justify-content-center mb-3 ">
            <div className="card shadow-sm" style={{ width: "800px" }}>

              <div className="card-body contact px-4">
                <div className="d-flex align-items-center " >
                  <button
                    type="button"
                    onClick={() => router.back()}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40, // similar circular size
                      height: 40, // height same as width
                      fontSize: 20,
                      fontWeight: 800,
                      borderRadius: "50%",
                      border: "1px solid #d0d0d0",
                      backgroundColor: hover ? "#e6f0ff" : "#f8f9fa",
                      color: hover ? "#0c6cd3" : "#0f65c7",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <FaArrowLeft />

                  </button>
                </div>
                <div className="text-center mb-3">
                  <h5 className="mb-1">Book Your Appointment</h5>
                  <p className="small mb-4">
                    Please fill the details of exact person for whom consultation is needed.
                  </p>
                  <hr className="bg-dark" />
                </div>

                <form onSubmit={handleSubmit}>

                  {/* ---------------- Row 1 ---------------- */}
                  <div className="row gx-3">
                    <div className="col-lg-4 col-md-6 mb-2">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${formErrors.firstName ? "border border-danger" : ""}`}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-lg-4 col-md-6 mb-2">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${formErrors.lastName ? "border border-danger" : ""}`}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-lg-4 col-md-6 mb-2">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className={`form-control form-control-sm ${formErrors.email ? "border border-danger" : ""}`}
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* ---------------- Row 2 ---------------- */}
                  <div className="row gx-3">
                    <div className="col-lg-4 col-md-6 mb-2">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className={`form-control form-control-sm ${formErrors.phoneNumber ? "border border-danger" : ""}`}
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-lg-4 col-md-6 mb-2">
                      <label className="form-label">Selected Plan</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.plan}
                        readOnly
                      />
                    </div>

                    <div className="col-lg-4 col-md-6 mb-2">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleDateSelect}
                      />
                    </div>
                  </div>

                  {/* ---------------- Row 3 ---------------- */}
                  <div className="row gx-3">
                    <div className="col-lg-4 col-md-6 ">
                      <label className="form-label">Price</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.amount}
                        readOnly
                      />
                    </div>

                    <div className="col-lg-4 col-md-6 ">
                      <label className="form-label">Duration (min)</label>
                      <input
                        className="form-control form-control-sm"
                        value={formData.duration}
                        readOnly
                      />
                    </div>
                    {showCouponField && (
                      <div className="col-lg-4 col-md-6 ">
                        <label className="form-label">Coupon Code</label>
                        <div className="input-group input-group-sm">
                          <input
                            type="text"
                            className="form-control"
                            value={couponCode}
                            onChange={handleCouponChange}
                          />
                          <button
                            className="btn btn-outline-primary"
                            type="button"
                            onClick={applyCoupon}
                          >
                            Apply
                          </button>
                        </div>


                      </div>
                    )}
                  </div>

              

                  {/* ---------------- Coupon + Details ---------------- */}

                  <div className="col-lg-8 col-md-6 mb-1 mx-auto">
                    <label className="form-label">Details</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      value={formData.details}
                      onChange={handleChange}
                    />
                  </div>

                  {/* ---------------- Submit ---------------- */}
                  <div className="row mt-2">
                    <div className="col-lg-3 col-md-4 col-6 mx-auto text-center">
                      <button type="submit" className="btn btn-primary btn-sm px-4">
                        Book Appointment
                      </button>
                    </div>
                  </div>

                </form>
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