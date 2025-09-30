'use client';
import Link from 'next/link';
import React, { useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL;
const Security = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token"); // Adjust key name if needed
      const response = await fetch(`https://appointify.coinagesoft.com/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        alert("Password changed successfully.");
        handleReset();
      } else if (response.status === 401) {
        alert("Unauthorized. Please login again.");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.title || 'Something went wrong'}`);
      }
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };
  

  const handleReset = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
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
                <Link className="nav-link active" href="/Dasboard/Security">
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
          <div className="card mb-4">
            <h5 className="card-header">Change Password</h5>
            <div className="card-body pt-1">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="mb-4 col-md-6 form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          className="form-control"
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          placeholder="********"
                          value={formData.currentPassword}
                          onChange={handleChange}
                        />
                        <label htmlFor="currentPassword">Current Password</label>
                      </div>
                      <span className="input-group-text cursor-pointer">
                        <i className="ri-eye-off-line"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-md-6 form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          className="form-control"
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          placeholder="********"
                          value={formData.newPassword}
                          onChange={handleChange}
                        />
                        <label htmlFor="newPassword">New Password</label>
                      </div>
                      <span className="input-group-text cursor-pointer">
                        <i className="ri-eye-off-line"></i>
                      </span>
                    </div>
                  </div>

                  <div className="col-md-6 form-password-toggle">
                    <div className="input-group input-group-merge">
                      <div className="form-floating form-floating-outline">
                        <input
                          className="form-control"
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          placeholder="********"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                      </div>
                      <span className="input-group-text cursor-pointer">
                        <i className="ri-eye-off-line"></i>
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="text-body">Password Requirements:</h6>
                <ul className="ps-4 mb-3">
                  <li className="mb-2">Minimum 8 characters long - the more, the better</li>
                  <li className="mb-2">At least one lowercase character</li>
                  <li>At least one number, symbol, or whitespace character</li>
                </ul>

                <div className="mt-4">
                  <button type="submit" className="btn btn-primary me-3">Save changes</button>
                  <button type="button" onClick={handleReset} className="btn btn-outline-secondary">Reset</button>
                </div>
              </form>
            </div>
          </div>
          {/* /Change Password Form */}
        </div>
      </div>
    </div>
  );
};

export default Security;
