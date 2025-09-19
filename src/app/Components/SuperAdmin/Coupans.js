"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSpinner, FaPlus } from "react-icons/fa";

const API_BASE = "https://appo.coinagesoft.com/api/superadmin/coupons";

const Coupans = () => {
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

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ✅ Get token helper
  const getAuthHeaders = () => {
    return { Authorization: `Bearer ${token}` };
  };

  // ✅ Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE, { headers: getAuthHeaders() });
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setAlertMessage({ type: 'error', text: 'Failed to load coupons. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCoupons();
  }, [token]);

  // Auto-hide alert messages after 5 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  // ✅ Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Form validation
  const validateForm = () => {
    const validationErrors = {};

    if (!form.code || form.code.trim() === '') {
      validationErrors.code = 'Coupon code is required';
    } else if (form.code.length < 3) {
      validationErrors.code = 'Coupon code must be at least 3 characters';
    }

    if (!form.discountValue || form.discountValue === '') {
      validationErrors.discountValue = 'Discount value is required';
    } else if (parseFloat(form.discountValue) <= 0) {
      validationErrors.discountValue = 'Discount value must be greater than 0';
    } else if (form.discountType === 'percentage' && parseFloat(form.discountValue) > 100) {
      validationErrors.discountValue = 'Percentage discount cannot exceed 100%';
    }

    if (!form.maxUsage || form.maxUsage === '') {
      validationErrors.maxUsage = 'Max usage is required';
    } else if (parseInt(form.maxUsage) <= 0) {
      validationErrors.maxUsage = 'Max usage must be greater than 0';
    }

    if (!form.expiresAt || form.expiresAt === '') {
      validationErrors.expiresAt = 'Expiration date is required';
    } else {
      const expiryDate = new Date(form.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate <= today) {
        validationErrors.expiresAt = 'Expiration date must be in the future';
      }
    }

    return validationErrors;
  };

  // ✅ Save (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      if (form.id) {
        await axios.patch(`${API_BASE}/${form.id}`, form, {
          headers: getAuthHeaders(),
        });
        setAlertMessage({ type: 'success', text: 'Coupon updated successfully!' });
      } else {
        await axios.post(API_BASE, form, { headers: getAuthHeaders() });
        setAlertMessage({ type: 'success', text: 'Coupon created successfully!' });
      }
      setForm({
        id: null,
        code: "",
        discountType: "percentage",
        discountValue: "",
        maxUsage: "",
        expiresAt: "",
      });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      console.error('Error saving coupon:', err);
      setAlertMessage({ type: 'error', text: 'Failed to save coupon. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Edit
  const handleEdit = (coupon) => {
    setForm({
      ...coupon,
      expiresAt: coupon.expiresAt?.split("T")[0] || ""
    });
    setShowForm(true);
    setErrors({});
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
      await axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      setCoupons(coupons.filter((c) => c.id !== id));
      setAlertMessage({ type: 'success', text: 'Coupon deleted successfully!' });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setAlertMessage({ type: 'error', text: 'Failed to delete coupon. Please try again.' });
    } finally {
      setDeleting(null);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      id: null,
      code: "",
      discountType: "percentage",
      discountValue: "",
      maxUsage: "",
      expiresAt: "",
    });
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="card p-3 rounded-4 mt-5">
      <div className="card-header border-bottom mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Coupons Management</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus className="me-1" />
          {showForm ? 'Hide Form' : 'Add Coupon'}
        </button>
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mb-3`} role="alert">
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">{form.id ? 'Edit Coupon' : 'Create New Coupon'}</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="e.g., SAVE20"
                    className={`form-control ${errors.code ? 'is-invalid' : ''}`}
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
                  <label className="form-label">
                    Discount Value {form.discountType === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    placeholder={form.discountType === 'percentage' ? '20' : '10.00'}
                    className={`form-control ${errors.discountValue ? 'is-invalid' : ''}`}
                    value={form.discountValue}
                    onChange={handleChange}
                    min="0"
                    step={form.discountType === 'percentage' ? '1' : '0.01'}
                  />
                  {errors.discountValue && <div className="invalid-feedback">{errors.discountValue}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Max Usage</label>
                  <input
                    type="number"
                    name="maxUsage"
                    placeholder="100"
                    className={`form-control ${errors.maxUsage ? 'is-invalid' : ''}`}
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
                    className={`form-control ${errors.expiresAt ? 'is-invalid' : ''}`}
                    value={form.expiresAt}
                    onChange={handleChange}
                  />
                  {errors.expiresAt && <div className="invalid-feedback">{errors.expiresAt}</div>}
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <><FaSpinner className="fa-spin me-2" />Saving...</> : <><FaPlus className="me-1" />{form.id ? 'Update' : 'Create'} Coupon</>}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <FaSpinner className="fa-spin me-2" />
          Loading coupons...
        </div>
      )}

      {/* No Coupons Message */}
      {!loading && coupons.length === 0 && (
        <div className="text-center py-4 text-muted">
          <p className="mb-2">No coupons found.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <FaPlus className="me-1" />
            Create Your First Coupon
          </button>
        </div>
      )}

      {/* Table for larger screens */}
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
                  <td>
                    <span className="fw-bold text-primary">{c.code}</span>
                  </td>
                  <td>
                    <span className={`badge ${c.discountType === 'percentage' ? 'bg-info' : 'bg-success'}`}>
                      {c.discountType === 'percentage' ? 'Percentage' : 'Flat'}
                    </span>
                  </td>
                  <td>
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </td>
                  <td>
                    <span className="text-muted">
                      {c.usedCount || 0} / {c.maxUsage}
                    </span>
                    <div className="progress mt-1" style={{ height: '4px' }}>
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${Math.min(((c.usedCount || 0) / c.maxUsage) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    {new Date(c.expiresAt) > new Date() ? (
                      <span className="text-success">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-danger">
                        Expired
                      </span>
                    )}
                  </td>
                  <td>
                    {c.isActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(c)}
                        disabled={saving || deleting === c.id}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c.id)}
                        disabled={saving || deleting === c.id}
                      >
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

      {/* Cards for mobile screens */}
      {!loading && coupons.length > 0 && (
        <div className="d-block d-md-none">
          {coupons.map((c) => (
            <div key={c.id} className="card mb-3 shadow-sm border rounded-lg p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="fw-bold text-primary mb-0">{c.code}</h6>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(c)}
                    disabled={saving || deleting === c.id}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(c.id)}
                    disabled={saving || deleting === c.id}
                  >
                    {deleting === c.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                  </button>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <small className="text-muted">Type</small>
                  <div>
                    <span className={`badge ${c.discountType === 'percentage' ? 'bg-info' : 'bg-success'}`}>
                      {c.discountType === 'percentage' ? 'Percentage' : 'Flat'}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Value</small>
                  <div className="fw-bold">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Usage</small>
                  <div>
                    <span className="text-muted">
                      {c.usedCount || 0} / {c.maxUsage}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Status</small>
                  <div>
                    {c.isActive ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <small className="text-muted">Expires</small>
                  <div>
                    {new Date(c.expiresAt) > new Date() ? (
                      <span className="text-success">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-danger">Expired</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupans;
