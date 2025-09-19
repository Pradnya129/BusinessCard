'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubscriptionAssigned = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic inputs
  const [billingType, setBillingType] = useState('annual'); // default
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
  const fetchSubscription = async () => {
    
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }
    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    const url = `https://appo.coinagesoft.com/api/superAdmin/sub_plans/subscriptions/${adminId}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle empty subscription array or "No subscriptions found" message
    if (
      !response.data || 
      (Array.isArray(response.data) && response.data.length === 0) ||
      response.data.error === 'No subscriptions found'
    ) {
      setSubscription(null); // no subscription
    } else {
      const subscriptionData = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      setSubscription(subscriptionData);
    }
  } catch (err) {
    console.error('Error fetching subscription:', err);
    setError('Failed to load subscription data');
  } finally {
    setLoading(false);
  }
};


    fetchSubscription();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="badge bg-success d-inline-flex align-items-center">
            <FaCheckCircle className="me-1" />
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="badge bg-warning d-inline-flex align-items-center">
            <FaTimesCircle className="me-1" />
            Inactive
          </span>
        );
      case 'Expired':
        return (
          <span className="badge bg-danger d-inline-flex align-items-center">
            <FaTimesCircle className="me-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary d-inline-flex align-items-center">
            <FaClock className="me-1" />
            {status}
          </span>
        );
    }
  };

const handleSubscribe = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token found');
      return;
    }

    if (!subscription?.plan?.id) {
      toast.error('Plan ID not found');
      return;
    }

     if (subscription.isActive) {
      toast.info('You already have an active subscription.');
      return;
    }
    // 🔹 Check if coupon was already marked as used in UI
    if (couponCode.trim().toLowerCase() === 'USED_ALREADY') {
      toast.info('You have already used this coupon.');
      return; // ⛔ stop here, no API call
    }

    // 🔹 Dynamic payload
    const payload = {
      planId: subscription.plan.id,
      billingType,
    };
    if (couponCode.trim()) {
      payload.couponCode = couponCode.trim();
    }

    const response = await axios.post(
      'https://appo.coinagesoft.com/api/admin/sub_plans/create-order',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Subscribe response:', response.data);
    const {
      orderId,
      amount,
      currency,
      planId,
      couponId,
      billingType: confirmedBillingType,
    } = response.data;

    // 🔹 Initialize Razorpay
    const options = {
      key: 'rzp_test_G5ZTKDD6ejrInm', // Razorpay test key
      amount,
      currency,
      name: 'Subscription Payment',
      description: 'Subscribe to plan',
      order_id: orderId,
      handler: async function (rzpResponse) {
        try {
          // 🔹 Build verify payload
          const verifyPayload = {
            razorpay_payment_id: rzpResponse.razorpay_payment_id,
            razorpay_order_id: rzpResponse.razorpay_order_id,
            razorpay_signature: rzpResponse.razorpay_signature, // ✅ Correct
            planId,
            billingType: confirmedBillingType,
          };
          if (couponId) {
            verifyPayload.couponId = couponId;
          }

          const verifyResponse = await axios.post(
            'https://appo.coinagesoft.com/api/admin/sub_plans/verify-payment',
            verifyPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          console.log('Verify response:', verifyResponse.data);
          toast.success('Payment successful! Subscription activated.');
          window.location.reload();
        } catch (verifyError) {
          console.error('Payment verification failed:', verifyError);
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: 'User Name', // Replace with real user data
        email: 'user@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
} catch (error) {
  const msg = error.response?.data?.error;

  if (msg) {
    if (msg.includes('already used')) {
      console.warn('Coupon already used:', msg);
      toast.info(msg);
      return;
    } else if (msg.includes('expired') || msg.includes('Invalid')) {
      console.warn('Coupon issue:', msg);
      toast.warning(msg);
      return;
    } else {
      console.error('Subscription error:', msg);
      toast.error(msg);
    }
  } else {
    console.error('Unexpected error:', error);
    toast.error('Failed to create subscription order');
  }
}


};


  if (loading) {
    return (
      <div className="text-center my-5">
        <FaSpinner className="spin" size={30} />
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5 text-center" role="alert">
        {error}
      </div>
    );
  }

if (!subscription) {
  return (
    <div className="text-center my-5">
      <FaTimesCircle size={40} className="text-warning mb-3" />
      <h4>No subscriptions assigned</h4>
      <p>It looks like you don’t have any active subscription yet.</p>
      <button
        className="btn btn-primary rounded-pill px-4 py-2"
        onClick={() => toast.info('Redirect to subscription page or plan selection')}
      >
        Explore Plans
      </button>
    </div>
  );
}



  const { createdAt, updatedAt, plan, isActive, startDate, endDate, paymentStatus } =
    subscription;

  const status = isActive ? 'Active' : 'Inactive';

  return (
    <>
      <div className="container my-5">
  <div className="row justify-content-center">
    <div className="col-lg-8 col-md-10">
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        {/* Header */}
        <div className="card-header bg-gradient text-white text-center py-5" 
             style={{ background: "linear-gradient(135deg, #4e73df, #224abe)" }}>
          <h2 className="mb-1 fw-bold">{plan?.planName || "My Subscription"}</h2>
          <p className="mb-0">Your subscription details at a glance</p>
        </div>

        {/* Body */}
        <div className="card-body p-5">
          {/* Pricing */}
          <div className="d-flex justify-content-center gap-4 mb-4">
            <span className="badge bg-primary fs-6 p-3 shadow-sm">
              Monthly: <strong>${plan?.monthlyPrice || "N/A"}</strong>
            </span>
            <span className="badge bg-success fs-6 p-3 shadow-sm">
              Annual: <strong>${plan?.annualPrice || "N/A"}</strong>
            </span>
          </div>

          {/* Status */}
          <div className="text-center mb-4">
            {getStatusBadge(status)}
          </div>

          {/* Controls */}
          <div className="mb-4 text-center">
            <label className="form-label fw-semibold">Billing Type</label>
            <select
              className="form-select w-auto mx-auto rounded-pill"
              value={billingType}
              onChange={(e) => setBillingType(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          {/* Coupon Input */}
          <div className="mb-4 text-center">
            <input
              type="text"
              className="form-control w-50 mx-auto text-center rounded-pill"
              placeholder="Enter coupon code (optional)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </div>

          {/* Subscribe Button */}
          <div className="text-center mb-4">
            {subscription.isActive ? (
              <span className="badge bg-success fs-6 px-4 py-2 rounded-pill">
                <FaCheckCircle className="me-2" /> Already Subscribed
              </span>
            ) : (
              <button
                className="btn btn-lg px-5 py-2 rounded-pill text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #1cc88a, #17a673)" }}
                onClick={handleSubscribe}
              >
                Subscribe Now
              </button>
            )}
          </div>

          {/* Info Cards */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-4 bg-light rounded-3 text-center shadow-sm">
                <h6 className="fw-bold mb-2">Subscription Period</h6>
                <p className="mb-1">
                  <strong>Start:</strong>{" "}
                  {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
                </p>
                <p className="mb-0">
                  <strong>End:</strong>{" "}
                  {endDate ? new Date(endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-4 bg-light rounded-3 text-center shadow-sm">
                <h6 className="fw-bold mb-2">Payment Details</h6>
                <p className="mb-1">
                  <strong>Status:</strong> {paymentStatus || "N/A"}
                </p>
                <small className="text-muted">Auto-renewal enabled</small>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="row g-4 mt-3">
            <div className="col-md-6">
              <div className="p-3 text-center rounded bg-white border shadow-sm">
                <h6 className="fw-semibold">Created On</h6>
                <p className="mb-0">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 text-center rounded bg-white border shadow-sm">
                <h6 className="fw-semibold">Last Updated</h6>
                <p className="mb-0">
                  {updatedAt ? new Date(updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-light text-center py-3">
          <small className="text-muted">
            Need help? <a href="#" className="text-primary">Contact Support</a>
          </small>
        </div>
      </div>
    </div>
  </div>
</div>

      <ToastContainer />
    </>
  );
};

export default SubscriptionAssigned;
