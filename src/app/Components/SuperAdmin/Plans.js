"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaSpinner, FaPlus, FaCrown } from "react-icons/fa";

const API_BASE = "http://103.224.247.28:5000/api/superAdmin/sub_plans";

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  const [form, setForm] = useState({
    id: null,
    planName: "",
    monthlyPrice: "",
    annualPrice: "",
    renewalLimit: "",
    features: "",
    description: "",
  });
  const [admins, setAdmins] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [assignForm, setAssignForm] = useState({
    adminId: "",
    startDate: "",
    endDate: "",
    paymentStatus: "Paid",
  });
  const [assignErrors, setAssignErrors] = useState({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ✅ Get token headers
  const getAuthHeaders = () => {
    return { Authorization: `Bearer ${token}` };
  };

  // ✅ Fetch plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/all`, { headers: getAuthHeaders() });
      setPlans(res.data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setAlertMessage({ type: 'error', text: 'Failed to load subscription plans. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch admins
  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`http://103.224.247.28:5000/api/superadmin/manageAdmins/`, { headers: getAuthHeaders() });
      setAdmins(res.data || []);
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchPlans();
    fetchAdmins();
  }, [token]);
  
  // Update assignForm when selectedPlan changes to prefill adminId if assigned
  useEffect(() => {
    if (selectedPlan && selectedPlan.assignedAdminId) {
      setAssignForm((prev) => ({ ...prev, adminId: selectedPlan.assignedAdminId }));
    } else {
      setAssignForm((prev) => ({ ...prev, adminId: "" }));
    }
  }, [selectedPlan]);

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

    if (!form.planName || form.planName.trim() === '') {
      validationErrors.planName = 'Plan name is required';
    } else if (form.planName.length < 3) {
      validationErrors.planName = 'Plan name must be at least 3 characters';
    }

    if (!form.monthlyPrice || form.monthlyPrice === '') {
      validationErrors.monthlyPrice = 'Monthly price is required';
    } else if (parseFloat(form.monthlyPrice) < 0) {
      validationErrors.monthlyPrice = 'Monthly price cannot be negative';
    }

    if (!form.annualPrice || form.annualPrice === '') {
      validationErrors.annualPrice = 'Annual price is required';
    } else if (parseFloat(form.annualPrice) < 0) {
      validationErrors.annualPrice = 'Annual price cannot be negative';
    }

    if (!form.renewalLimit || form.renewalLimit === '') {
      validationErrors.renewalLimit = 'Renewal limit is required';
    } else if (parseInt(form.renewalLimit) < 0) {
      validationErrors.renewalLimit = 'Renewal limit cannot be negative';
    }

    if (!form.features || form.features.trim() === '') {
      validationErrors.features = 'Features are required';
    } else {
      const featuresArray = form.features.split(',').map(f => f.trim()).filter(f => f !== '');
      if (featuresArray.length === 0) {
        validationErrors.features = 'At least one feature is required';
      }
    }

    if (!form.description || form.description.trim() === '') {
      validationErrors.description = 'Description is required';
    } else if (form.description.length < 10) {
      validationErrors.description = 'Description must be at least 10 characters';
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
  const payload = {
  planName: form.planName,
  monthlyPrice: Number(form.monthlyPrice),  // ensure number
  annualPrice: Number(form.annualPrice),    // ensure number
  renewalLimit: Number(form.renewalLimit),  // ensure number
  features: JSON.stringify(form.features.split(",").map(f => f.trim())), // stringified array
  description: form.description,
};


    if (form.id) {
      await axios.patch(`${API_BASE}/${form.id}`, payload, {
        headers: getAuthHeaders(),
      });
      setAlertMessage({ type: 'success', text: 'Plan updated successfully!' });
    } else {
      await axios.post(`${API_BASE}/add`, payload, { headers: getAuthHeaders() });
      setAlertMessage({ type: 'success', text: 'Plan created successfully!' });
    }

    setForm({
      id: null,
      planName: "",
      monthlyPrice: "",
      annualPrice: "",
      renewalLimit: "",
      features: "",
      description: "",
    });
    setShowForm(false);
    fetchPlans();
  } catch (err) {
    console.error('Error saving plan:', err.response?.data || err.message);
    setAlertMessage({ type: 'error', text: 'Failed to save plan. Please try again.' });
  } finally {
    setSaving(false);
  }
};


  // ✅ Edit
  const handleEdit = (plan) => {
    setForm({
      ...plan,
      features: JSON.parse(plan.features).join(", "),
    });
    setShowForm(true);
    setErrors({});
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
      return;
    }

    setDeleting(id);
    try {
        console.log("Deleting plan ID:", id);
      await axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() });
      setPlans(plans.filter((p) => p.id !== id));
      setAlertMessage({ type: 'success', text: 'Plan deleted successfully!' });
    } catch (err) {
      console.error('Error deleting plan:', err);
      setAlertMessage({ type: 'error', text: 'Failed to delete plan. Please try again.' });
    } finally {
      setDeleting(null);
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setForm({
      id: null,
      planName: "",
      monthlyPrice: "",
      annualPrice: "",
      renewalLimit: "",
      features: "",
      description: "",
    });
    setErrors({});
    setShowForm(false);
  };

  // ✅ Parse features for display
  const parseFeatures = (featuresString) => {
    try {
      return JSON.parse(featuresString);
    } catch {
      return [];
    }
  };

  // ✅ Handle assign form change
  const handleAssignChange = (e) => {
    setAssignForm({ ...assignForm, [e.target.name]: e.target.value });
  };

  // ✅ Validate assign form
  const validateAssignForm = () => {
    const errors = {};
    if (!assignForm.adminId) errors.adminId = 'Please select an admin';
    if (!assignForm.startDate) errors.startDate = 'Start date is required';
    if (!assignForm.endDate) errors.endDate = 'End date is required';
    if (assignForm.startDate && assignForm.endDate && new Date(assignForm.startDate) >= new Date(assignForm.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
    return errors;
  };

  // ✅ Handle assign
  const handleAssign = async (e) => {
    e.preventDefault();
    const errors = validateAssignForm();
    if (Object.keys(errors).length > 0) {
      setAssignErrors(errors);
      return;
    }
    setAssignErrors({});
    setSaving(true);
    try {
      const payload = {
        adminId: assignForm.adminId,
        subscriptionPlanId: selectedPlan.id,
        startDate: assignForm.startDate,
        endDate: assignForm.endDate,
        paymentStatus: assignForm.paymentStatus,
      };
      await axios.post(`${API_BASE}/subscriptions/add`, payload, { headers: getAuthHeaders() });
      setAlertMessage({ type: 'success', text: 'Subscription assigned successfully!' });
      setShowAssignModal(false);
      setAssignForm({
        adminId: "",
        startDate: "",
        endDate: "",
        paymentStatus: "Paid",
      });
    } catch (err) {
      console.error('Error assigning subscription:', err);
      setAlertMessage({ type: 'error', text: 'Failed to assign subscription. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Open assign modal
  const openAssignModal = (plan) => {
    setSelectedPlan(plan);
    setShowAssignModal(true);
    setAssignErrors({});
  };

  return (
    <div className="card p-3 rounded-4 mt-5">
      <div className="card-header border-bottom mb-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Subscription Plans</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus className="me-1" />
          {showForm ? 'Hide Form' : 'Add Plan'}
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
            <h6 className="mb-0">{form.id ? 'Edit Plan' : 'Create New Plan'}</h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Plan Name</label>
                  <input
                    type="text"
                    name="planName"
                    placeholder="Plan Name"
                    className={`form-control ${errors.planName ? 'is-invalid' : ''}`}
                    value={form.planName}
                    onChange={handleChange}
                  />
                  {errors.planName && <div className="invalid-feedback">{errors.planName}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Monthly Price</label>
                  <input
                    type="number"
                    name="monthlyPrice"
                    placeholder="Monthly Price"
                    className={`form-control ${errors.monthlyPrice ? 'is-invalid' : ''}`}
                    value={form.monthlyPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                  {errors.monthlyPrice && <div className="invalid-feedback">{errors.monthlyPrice}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Annual Price</label>
                  <input
                    type="number"
                    name="annualPrice"
                    placeholder="Annual Price"
                    className={`form-control ${errors.annualPrice ? 'is-invalid' : ''}`}
                    value={form.annualPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                  {errors.annualPrice && <div className="invalid-feedback">{errors.annualPrice}</div>}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Renewal Limit</label>
                  <input
                    type="number"
                    name="renewalLimit"
                    placeholder="Renewal Limit"
                    className={`form-control ${errors.renewalLimit ? 'is-invalid' : ''}`}
                    value={form.renewalLimit}
                    onChange={handleChange}
                    min="0"
                  />
                  {errors.renewalLimit && <div className="invalid-feedback">{errors.renewalLimit}</div>}
                </div>

                <div className="col-md-8">
                  <label className="form-label">Features (comma separated)</label>
                  <input
                    type="text"
                    name="features"
                    placeholder="Feature1, Feature2, Feature3"
                    className={`form-control ${errors.features ? 'is-invalid' : ''}`}
                    value={form.features}
                    onChange={handleChange}
                  />
                  {errors.features && <div className="invalid-feedback">{errors.features}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    placeholder="Description"
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? <><FaSpinner className="fa-spin me-2" />Saving...</> : <><FaPlus className="me-1" />{form.id ? 'Update' : 'Create'} Plan</>}
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
          Loading plans...
        </div>
      )}

      {/* No Plans Message */}
      {!loading && plans.length === 0 && (
        <div className="text-center py-4 text-muted">
          <p className="mb-2">No subscription plans found.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <FaPlus className="me-1" />
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Table for larger screens */}
      {!loading && plans.length > 0 && (
        <div className="table-responsive d-none d-md-block">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Plan Name</th>
                <th>Monthly Price</th>
                <th>Annual Price</th>
                <th>Renewal Limit</th>
                <th>Features</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="fw-bold text-primary">{p.planName}</span>
                  </td>
                  <td>${p.monthlyPrice}</td>
                  <td>${p.annualPrice}</td>
                  <td>{p.renewalLimit}</td>
                  <td>{parseFeatures(p.features).join(", ")}</td>
                  <td>{p.description}</td>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(p)}
                        disabled={saving || deleting === p.id}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => openAssignModal(p)}
                        disabled={saving || deleting === p.id}
                      >
                        <FaCrown />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(p.id)}
                        disabled={saving || deleting === p.id}
                      >
                        {deleting === p.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                      </button>
                      {p.assignedAdminName && (
                        <small className="text-muted ms-2">Assigned to: {p.assignedAdminName}</small>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards for mobile screens */}
      {!loading && plans.length > 0 && (
        <div className="d-block d-md-none">
          {plans.map((p) => (
            <div key={p.id} className="card mb-3 shadow-sm border rounded-lg p-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="fw-bold text-primary mb-0">{p.planName}</h6>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(p)}
                    disabled={saving || deleting === p.id}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => openAssignModal(p)}
                    disabled={saving || deleting === p.id}
                  >
                    <FaCrown />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(p.id)}
                    disabled={saving || deleting === p.id}
                  >
                    {deleting === p.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                  </button>
                </div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <small className="text-muted">Monthly Price</small>
                  <div>${p.monthlyPrice}</div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Annual Price</small>
                  <div>${p.annualPrice}</div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Renewal Limit</small>
                  <div>{p.renewalLimit}</div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Features</small>
                  <div>{parseFeatures(p.features).join(", ")}</div>
                </div>
                <div className="col-12">
                  <small className="text-muted">Description</small>
                  <div>{p.description}</div>
                </div>
                {p.assignedAdminName && (
                  <div className="col-12">
                    <small className="text-muted">Assigned to</small>
                    <div className="text-primary fw-bold">{p.assignedAdminName}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Subscription Plan</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedPlan && (
                  <div className="mb-3">
                    <h6>Selected Plan: <span className="text-primary">{selectedPlan.planName}</span></h6>
                    <p className="text-muted">{selectedPlan.description}</p>
                  </div>
                )}
                <form onSubmit={handleAssign}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Select Admin</label>
                      <select
                        name="adminId"
                        className={`form-select ${assignErrors.adminId ? 'is-invalid' : ''}`}
                        value={assignForm.adminId}
                        onChange={handleAssignChange}
                      >
                        <option value="">Choose an admin...</option>
                        {admins.map((admin) => (
                          <option key={admin.id} value={admin.id} selected={selectedPlan.assignedAdminId === admin.id}>
                            {admin.name} ({admin.email})
                          </option>
                        ))}
                      </select>
                      {assignErrors.adminId && <div className="invalid-feedback">{assignErrors.adminId}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Status</label>
                      <select
                        name="paymentStatus"
                        className="form-select"
                        value={assignForm.paymentStatus}
                        onChange={handleAssignChange}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        className={`form-control ${assignErrors.startDate ? 'is-invalid' : ''}`}
                        value={assignForm.startDate}
                        onChange={handleAssignChange}
                      />
                      {assignErrors.startDate && <div className="invalid-feedback">{assignErrors.startDate}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        className={`form-control ${assignErrors.endDate ? 'is-invalid' : ''}`}
                        value={assignForm.endDate}
                        onChange={handleAssignChange}
                      />
                      {assignErrors.endDate && <div className="invalid-feedback">{assignErrors.endDate}</div>}
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-success" disabled={saving}>
                      {saving ? <><FaSpinner className="fa-spin me-2" />Assigning...</> : <><FaCrown className="me-1" />Assign Subscription</>}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)} disabled={saving}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
