"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSpinner, FaSearch, FaCalendarAlt, FaDollarSign, FaCreditCard, FaUser, FaBuilding, FaCrown, FaCheckCircle, FaTimesCircle, FaClock, FaFilter } from "react-icons/fa";

const SubscriptionRenewals = () => {
  const [renewals, setRenewals] = useState([]);
  const [filteredRenewals, setFilteredRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://appo.coinagesoft.com/api/superadmin/renewals",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRenewals(res.data || []);
        setFilteredRenewals(res.data || []);
      } catch (err) {
        console.error("Error fetching renewals:", err);
        setAlertMessage({ type: 'error', text: 'Failed to load subscription renewals. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRenewals();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Filter renewals based on search and filters
  useEffect(() => {
    let filtered = renewals;

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admin.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.plan.planName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status.toLowerCase() === statusFilter);
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(r => r.subscriptionTrack.paymentStatus.toLowerCase() === paymentFilter);
    }

    setFilteredRenewals(filtered);
  }, [renewals, searchTerm, statusFilter, paymentFilter]);

  // Auto-hide alert messages after 5 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // Calculate statistics
  const stats = {
    total: renewals.length,
    active: renewals.filter(r => r.status === "Active").length,
    expired: renewals.filter(r => r.status === "Expired").length,
    totalRevenue: renewals.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0),
    paid: renewals.filter(r => r.subscriptionTrack.paymentStatus === "Paid").length,
    pending: renewals.filter(r => r.subscriptionTrack.paymentStatus === "Pending").length,
  };

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
        <FaSpinner className="fa-spin text-primary mb-3" style={{ fontSize: '2rem' }} />
        <h5 className="text-muted">Loading subscription renewals...</h5>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Subscription Renewals
          </h2>
          <p className="text-muted mb-0">Manage and monitor all subscription renewals</p>
        </div>
        {/* <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>
            <FaSpinner className="me-1" />
            Refresh
          </button>
        </div> */}
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mb-4 shadow-sm`} role="alert">
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}

      {/* Statistics Cards */}
      {/* <div className="row g-3 mb-4">
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaCalendarAlt className="text-primary mb-2" style={{ fontSize: '1.5rem' }} />
              <h4 className="mb-1">{stats.total}</h4>
              <small className="text-muted">Total Renewals</small>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaCheckCircle className="text-success mb-2" style={{ fontSize: '1.5rem' }} />
              <h4 className="mb-1">{stats.active}</h4>
              <small className="text-muted">Active</small>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaTimesCircle className="text-danger mb-2" style={{ fontSize: '1.5rem' }} />
              <h4 className="mb-1">{stats.expired}</h4>
              <small className="text-muted">Expired</small>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaDollarSign className="text-success mb-2" style={{ fontSize: '1.5rem' }} />
              <h4 className="mb-1">${stats.totalRevenue.toFixed(2)}</h4>
              <small className="text-muted">Total Revenue</small>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaCreditCard className="text-success mb-2" style={{ fontSize: '1.5rem' }} />
              <h4 className="mb-1">{stats.paid}</h4>
              <small className="text-muted">Paid</small>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <FaClock className="text-warning mb-2" style={{ fontSize: '1.5rem' }} />
              <h4 className="mb-1">{stats.pending}</h4>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>
      </div> */}

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">
                <FaSearch className="me-1" />
                Search
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, business, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">
                <FaFilter className="me-1" />
                Status
              </label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">
                <FaCreditCard className="me-1" />
                Payment Status
              </label>
              <select
                className="form-select"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="card border-0 shadow-sm d-none d-lg-block">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 fw-bold py-3 px-4">Admin Details</th>
                  <th className="border-0 fw-bold py-3 px-4">Business</th>
                  <th className="border-0 fw-bold py-3 px-4">Plan</th>
                  <th className="border-0 fw-bold py-3 px-4">Period</th>
                  <th className="border-0 fw-bold py-3 px-4">Amount</th>
                  <th className="border-0 fw-bold py-3 px-4">Coupon</th>
                  <th className="border-0 fw-bold py-3 px-4">Status</th>
                  <th className="border-0 fw-bold py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.length > 0 ? (
                  filteredRenewals.map((r) => (
                    <tr key={r.id} className="border-bottom border-light">
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-sm me-3">
                            <div className="avatar-initial bg-primary rounded-circle">
                              <FaUser className="text-white" />
                            </div>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">
                              {r.admin.firstName} {r.admin.lastName}
                            </div>
                            <small className="text-muted">{r.admin.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center">
                          <FaBuilding className="text-muted me-2" />
                          <span className="fw-medium">{r.admin.businessName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge bg-info">{r.plan.planName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-muted small">
                          <div>{new Date(r.startDate).toLocaleDateString()}</div>
                          <div>to {new Date(r.endDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="fw-bold text-success">${r.amount}</span>
                      </td>
                      <td className="py-3 px-4">
                        {r.couponCode ? (
                          <span className="badge bg-warning text-dark">{r.couponCode}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getPaymentBadge(r.subscriptionTrack.paymentStatus)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        <FaSearch className="mb-2" style={{ fontSize: '2rem' }} />
                        <p className="mb-0">No renewals found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="d-lg-none">
        {filteredRenewals.length > 0 ? (
          filteredRenewals.map((r) => (
            <div key={r.id} className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm me-3">
                      <div className="avatar-initial bg-primary rounded-circle">
                        <FaUser className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">
                        {r.admin.firstName} {r.admin.lastName}
                      </h6>
                      <small className="text-muted">{r.admin.email}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {getStatusBadge(r.status)}
                    {getPaymentBadge(r.subscriptionTrack.paymentStatus)}
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted d-block">Business</small>
                    <div className="d-flex align-items-center">
                      <FaBuilding className="text-muted me-1" />
                      <span className="fw-medium">{r.admin.businessName}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Plan</small>
                    <span className="badge bg-info">{r.plan.planName}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Amount</small>
                    <span className="fw-bold text-success">${r.amount}</span>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Coupon</small>
                    {r.couponCode ? (
                      <span className="badge bg-warning text-dark">{r.couponCode}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block">Period</small>
                    <div className="text-muted small">
                      {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <FaSearch className="text-muted mb-3" style={{ fontSize: '3rem' }} />
            <h5 className="text-muted">No renewals found</h5>
            <p className="text-muted mb-0">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionRenewals;
