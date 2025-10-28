'use client';
import Link from 'next/link';
import React, { useState } from 'react';

const Security = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://appo.coinagesoft.com/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Password changed successfully.');
        handleReset();
      } else if (response.status === 401) {
        alert('Unauthorized. Please login again.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Error: ${errorData.message || 'Something went wrong'}`);
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row">
        <div className="col-md-12">
          {/* Navigation Tabs */}
          <div className="nav-align-top mb-4">
            <ul className="nav nav-pills flex-column flex-md-row mb-4 gap-2 gap-lg-0">
              <li className="nav-item">
                <Link className="nav-link" href="/Dashboard/Profile">
                  <i className="ri-group-line me-2"></i> My Profile
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" href="/Dashboard/Security">
                  <i className="ri-lock-line me-2"></i> Security
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/Dashboard/Billing">
                  <i className="ri-bookmark-line me-2"></i> Billing & Plans
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/Dashboard/Policies">
                  <i className="ri-bookmark-line me-2"></i> Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Change Password Form */}
          <div className="card mb-4 shadow-sm">
            <h5 className="card-header">Change Password</h5>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Current Password */}
                  <div className="col-md-6 position-relative">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        name="currentPassword"
                        id="currentPassword"
                        className="form-control"
                        placeholder="Enter current password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        aria-label="Current password"
                      />
                      <button
                        type="button"
                        className="btn input-group-text"
                        onClick={() => setShowCurrent((s) => !s)}
                        aria-pressed={showCurrent}
                        aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <i className={showCurrent ? 'ri-eye-line' : 'ri-eye-off-line'} />
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="col-md-6 position-relative">
                    <label htmlFor="newPassword" className="form-label">
                      New Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showNew ? 'text' : 'password'}
                        name="newPassword"
                        id="newPassword"
                        className="form-control"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        aria-label="New password"
                      />
                      <button
                        type="button"
                        className="btn input-group-text"
                        onClick={() => setShowNew((s) => !s)}
                        aria-pressed={showNew}
                        aria-label={showNew ? 'Hide new password' : 'Show new password'}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <i className={showNew ? 'ri-eye-line' : 'ri-eye-off-line'} />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="col-md-6 position-relative">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        id="confirmPassword"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        aria-label="Confirm new password"
                      />
                      <button
                        type="button"
                        className="btn input-group-text"
                        onClick={() => setShowConfirm((s) => !s)}
                        aria-pressed={showConfirm}
                        aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <i className={showConfirm ? 'ri-eye-line' : 'ri-eye-off-line'} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="text-body fw-semibold mb-2">Password Requirements:</h6>
                  <ul className="ps-3 mb-4 small text-muted">
                    <li>Minimum 8 characters long</li>
                    <li>At least one lowercase character</li>
                    <li>At least one number, symbol, or whitespace character</li>
                  </ul>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button type="button" onClick={handleReset} className="btn btn-outline-secondary">
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* /Change Password Form */}
        </div>
      </div>
      <style jsx>{`
        .input-group .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Security;
