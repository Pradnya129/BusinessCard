"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  FaSpinner,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const Renewal = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded.id;
        setLoading(true);

        const res = await axios.get(
          `https://appo.coinagesoft.com/api/superadmin/renewals/by-admin/${adminId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Set renewals if found
        setRenewals(res.data || []);
      } catch (err) {
        // Handle 404 (no renewals found) gracefully
        if (err.response?.status === 404) {
          setRenewals([]); // empty array to show "No renewals found"
        } else {
          console.error("Error fetching renewals:", err);
          setAlertMessage({
            type: "error",
            text: "Failed to load your subscription renewals. Please try again.",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRenewals();
    else setLoading(false);
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <span className="badge bg-success"><FaCheckCircle className="me-1" />Active</span>;
      case "Expired":
        return <span className="badge bg-danger"><FaTimesCircle className="me-1" />Expired</span>;
      default:
        return <span className="badge bg-secondary"><FaClock className="me-1" />{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "Paid":
        return <span className="badge bg-success"><FaCheckCircle className="me-1" />Paid</span>;
      case "Pending":
        return <span className="badge bg-warning"><FaClock className="me-1" />Pending</span>;
      case "Failed":
        return <span className="badge bg-danger"><FaTimesCircle className="me-1" />Failed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="text-center">
        <FaSpinner className="fa-spin text-primary mb-3" style={{ fontSize: "2rem" }} />
        <h5 className="text-muted">Loading your renewals...</h5>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">My Subscription Renewals</h2>
          <p className="text-muted mb-0">Track your subscription status and payments</p>
        </div>
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <div
          className={`alert alert-${alertMessage.type === "error" ? "danger" : "success"} alert-dismissible fade show mb-4 shadow-sm`}
          role="alert"
        >
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}

      {/* Renewals Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold py-3 px-4">Plan</th>
                  <th className="border-0 fw-bold py-3 px-4">Period</th>
                  <th className="border-0 fw-bold py-3 px-4">Amount</th>
                  <th className="border-0 fw-bold py-3 px-4">Coupon</th>
                  <th className="border-0 fw-bold py-3 px-4">Status</th>
                  <th className="border-0 fw-bold py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {renewals.length > 0 ? (
                  renewals.map((r) => (
                    <tr key={r.id} className="border-bottom border-light">
                      <td className="py-3 px-4"><span className="badge bg-info">{r.plan.planName}</span></td>
                      <td className="py-3 px-4 text-muted small">
                        <div>{new Date(r.startDate).toLocaleDateString()}</div>
                        <div>to {new Date(r.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4"><span className="fw-bold text-success">Rs.{r.amount}</span></td>
                      <td className="py-3 px-4">
                        {r.couponCode ? (
                          <span className="badge bg-warning text-dark">{r.couponCode}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-4">{getPaymentBadge(r.subscriptionTrack.paymentStatus)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <FaSearch className="mb-2" style={{ fontSize: "2rem" }} />
                        <p className="mb-0">No renewals found for your account</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Renewal;
