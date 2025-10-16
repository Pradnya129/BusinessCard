"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSpinner, FaPlus } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api/superadmin/coupans"; // superadmin only

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const [form, setForm] = useState({
    id: null,
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxUsage: "",
    expiresAt: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const getAuthHeaders = () => ({ Authorization: `Bearer ${token}` });

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE, { headers: getAuthHeaders() });
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setAlertMessage({ type: "error", text: "Failed to load coupons." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCoupons();
    else setLoading(false);
  }, [token]);

  // Auto-hide alerts
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    const validationErrors = {};
    if (!form.code?.trim()) validationErrors.code = "Coupon code is required";
    if (!form.discountValue) validationErrors.discountValue = "Discount value is required";
    else if (form.discountType === "percentage" && parseFloat(form.discountValue) > 100)
      validationErrors.discountValue = "Percentage cannot exceed 100";
    if (!form.maxUsage || parseInt(form.maxUsage) <= 0)
      validationErrors.maxUsage = "Max usage must be greater than 0";
    if (!form.expiresAt) validationErrors.expiresAt = "Expiration date is required";
    else if (new Date(form.expiresAt) <= new Date())
      validationErrors.expiresAt = "Expiration date must be in the future";
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) return setErrors(validationErrors);

    setErrors({});
    setSaving(true);

    try {
      if (form.id) {
        await axios.patch(`${API_BASE}/${form.id}`, form, { headers: getAuthHeaders() });
        setAlertMessage({ type: "success", text: "Coupon updated successfully!" });
      } else {
        await axios.post(API_BASE, form, { headers: getAuthHeaders() });
        setAlertMessage({ type: "success", text: "Coupon created successfully!" });
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      console.error("Error saving coupon:", err);
      setAlertMessage({ type: "error", text: "Failed to save coupon." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setForm({ ...coupon, expiresAt: coupon.expiresAt?.split("T")[0] || "" });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      setCoupons(coupons.filter((c) => c.id !== id));
      setAlertMessage({ type: "success", text: "Coupon deleted successfully!" });
    } catch (err) {
      console.error("Error deleting coupon:", err);
      setAlertMessage({ type: "error", text: "Failed to delete coupon." });
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setForm({ id: null, code: "", discountType: "percentage", discountValue: "", maxUsage: "", expiresAt: "" });
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="card p-3 rounded-4 mt-5">
      {/* Header */}
      <div className="card-header border-bottom mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Coupons Management</h5>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <FaPlus className="me-1" />
          {showForm ? "Hide Form" : "Add Coupon"}
        </button>
      </div>

      {/* Alerts */}
      {alertMessage && (
        <div
          className={`alert alert-${alertMessage.type === "error" ? "danger" : "success"} alert-dismissible fade show mb-3`}
          role="alert"
        >
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h6>{form.id ? "Edit Coupon" : "Create New Coupon"}</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    className={`form-control ${errors.code ? "is-invalid" : ""}`}
                    value={form.code}
                    onChange={handleChange}
                  />
                  {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Discount Type</label>
                  <select
                    name="discountType"
                    className="form-select"
                    value={form.discountType}
                    onChange={handleChange}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount ($)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="number"
                    name="discountValue"
                    className={`form-control ${errors.discountValue ? "is-invalid" : ""}`}
                    value={form.discountValue}
                    onChange={handleChange}
                    min="0"
                    step={form.discountType === "percentage" ? "1" : "0.01"}
                  />
                  {errors.discountValue && <div className="invalid-feedback">{errors.discountValue}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Max Usage</label>
                  <input
                    type="number"
                    name="maxUsage"
                    className={`form-control ${errors.maxUsage ? "is-invalid" : ""}`}
                    value={form.maxUsage}
                    onChange={handleChange}
                    min="1"
                  />
                  {errors.maxUsage && <div className="invalid-feedback">{errors.maxUsage}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="date"
                    name="expiresAt"
                    className={`form-control ${errors.expiresAt ? "is-invalid" : ""}`}
                    value={form.expiresAt}
                    onChange={handleChange}
                  />
                  {errors.expiresAt && <div className="invalid-feedback">{errors.expiresAt}</div>}
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><FaSpinner className="fa-spin me-2" />Saving...</> : <><FaPlus className="me-1" />{form.id ? "Update" : "Create"} Coupon</>}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="text-center py-4"><FaSpinner className="fa-spin me-2" />Loading coupons...</div>}

      {/* No Coupons */}
      {!loading && coupons.length === 0 && (
        <div className="text-center py-4 text-muted">
          <p>No coupons found.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><FaPlus className="me-1" />Create Your First Coupon</button>
        </div>
      )}

      {/* Table */}
      {!loading && coupons.length > 0 && (
        <div className="table-responsive d-none d-md-block">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.discountType === "percentage" ? "Percentage" : "Flat"}</td>
                  <td>{c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                  <td>{c.usedCount || 0} / {c.maxUsage}</td>
                  <td>{new Date(c.expiresAt) > new Date() ? new Date(c.expiresAt).toLocaleDateString() : "Expired"}</td>
                  <td>{c.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(c)} disabled={saving || deleting === c.id}><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)} disabled={saving || deleting === c.id}>
                        {deleting === c.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && coupons.length > 0 && (
        <div className="d-block d-md-none">
          {coupons.map((c) => (
            <div key={c.id} className="card mb-3 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="fw-bold">{c.code}</h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(c)} disabled={saving || deleting === c.id}><FaEdit /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)} disabled={saving || deleting === c.id}>
                    {deleting === c.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                  </button>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6"><small>Type</small><div>{c.discountType === "percentage" ? "Percentage" : "Flat"}</div></div>
                <div className="col-6"><small>Value</small><div>{c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue}`}</div></div>
                <div className="col-6"><small>Usage</small><div>{c.usedCount || 0} / {c.maxUsage}</div></div>
                <div className="col-6"><small>Status</small><div>{c.isActive ? "Active" : "Inactive"}</div></div>
                <div className="col-12"><small>Expires</small><div>{new Date(c.expiresAt) > new Date() ? new Date(c.expiresAt).toLocaleDateString() : "Expired"}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
