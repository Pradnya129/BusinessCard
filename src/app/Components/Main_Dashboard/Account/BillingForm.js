'use client';
import Link from 'next/link';
import React, { useState } from 'react';

  const BillingForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    billingEmail: '',
    taxId: '',
    vatNumber: '',
    mobileNumber: '',
    country: 'USA',
    billingAddress: '',
    state: '',
    zipCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // 🔗 Connect your backend API here using Axios or Fetch
    // axios.post('/api/billing', formData)...
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      billingEmail: '',
      taxId: '',
      vatNumber: '',
      mobileNumber: '',
      country: 'USA',
      billingAddress: '',
      state: '',
      zipCode: ''
    });
  };

  return (
    <>
     <div className="col-md-12">
          <div className="nav-align-top">
                    <ul className="nav nav-pills flex-column flex-md-row mb-6 gap-2 gap-lg-0">
                      <li className="nav-item">
                        <Link className="nav-link" href="/Dashboard/Profile"
                          ><i className="ri-group-line me-2"></i> My Profile
                          </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" href="/Dashboard/Security"
                          ><i className="ri-lock-line me-2"></i> Security</Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link active" href="/Dashboard/Billing"
                          ><i className="ri-bookmark-line me-2"></i> Billing & Plans
                          </Link >
                      </li>
                       <li className="nav-item">
                <Link className="nav-link" href="/Dashboard/Policies">
                  <i className="ri-bookmark-line me-2"></i> Policies
                </Link>
              </li>
                   
                    </ul>
                  </div>
          </div>
   
    <div className="card mb-6">
      <h5 className="card-header">Billing Address</h5>
      <div className="card-body">
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <div className="row g-5">
            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                />
                <label htmlFor="companyName">Company Name</label>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <input
                  className="form-control"
                  type="text"
                  id="billingEmail"
                  name="billingEmail"
                  value={formData.billingEmail}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                />
                <label htmlFor="billingEmail">Billing Email</label>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  className="form-control"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="Enter Tax ID"
                />
                <label htmlFor="taxId">Tax ID</label>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <input
                  className="form-control"
                  type="text"
                  id="vatNumber"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  placeholder="Enter VAT Number"
                />
                <label htmlFor="vatNumber">VAT Number</label>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="input-group input-group-merge">
                <div className="form-floating form-floating-outline">
                  <input
                    className="form-control"
                    type="text"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="202 555 0111"
                  />
                  <label htmlFor="mobileNumber">Mobile</label>
                </div>
                <span className="input-group-text">US (+1)</span>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <select
                  id="country"
                  className="form-select"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option>USA</option>
                  <option>Canada</option>
                  <option>UK</option>
                  <option>India</option>
                  <option>France</option>
                </select>
                <label htmlFor="country">Country</label>
              </div>
            </div>

            <div className="col-12">
              <div className="form-floating form-floating-outline">
                <input
                  type="text"
                  className="form-control"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  placeholder="Billing Address"
                />
                <label htmlFor="billingAddress">Billing Address</label>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <input
                  className="form-control"
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="California"
                />
                <label htmlFor="state">State</label>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-floating form-floating-outline">
                <input
                  type="text"
                  className="form-control"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="231465"
                  maxLength="6"
                />
                <label htmlFor="zipCode">Zip Code</label>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button type="submit" className="btn btn-primary me-3">Save changes</button>
            <button type="reset" className="btn btn-outline-secondary">Reset</button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default BillingForm;
