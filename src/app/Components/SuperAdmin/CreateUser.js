'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateUser = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = 'Name is required';
    if (!user.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = 'Email is invalid';
    if (!user.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/admin/create_user', user, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User created successfully!');
      setUser({ name: '', email: '', phone: '' });
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 rounded-4 mt-5">
      <h5>Create New User</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={user.name}
            onChange={handleChange}
            placeholder="Enter full name"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={user.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            name="phone"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            value={user.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><FaSpinner className="fa-spin me-2" />Creating...</> : 'Create User'}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default CreateUser;
