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
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setFetchError('');
    console.log('Token:', token);
    try {
      const response = await axios.get('https://appo.coinagesoft.com/api/admin/all_user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response:', response.data);
      setAllUsers(response.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError('Failed to fetch users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    if (isEditing) {
      setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  const validate = (userToValidate) => {
    const newErrors = {};
    if (!userToValidate.name.trim()) newErrors.name = 'Name is required';
    if (!userToValidate.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(userToValidate.email)) newErrors.email = 'Email is invalid';
    if (!userToValidate.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(user)) return;

    setLoading(true);
    try {
      const response = await axios.post('https://appo.coinagesoft.com/api/admin/create_user', user, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User created successfully!');
      setUser({ name: '', email: '', phone: '' });
      setErrors({});
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setIsEditing(true);
    setEditingUser(user);
    setErrors({});
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate(editingUser)) return;

    setLoading(true);
    try {
      await axios.put(`https://appo.coinagesoft.com/api/admin/user/${editingUser.id}`, editingUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User updated successfully!');
      setIsEditing(false);
      setEditingUser(null);
      setErrors({});
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      await axios.delete(`https://appo.coinagesoft.com/api/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully!');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 rounded-4 mt-5">
      <h5>{isEditing ? 'Edit User' : 'Create New User'}</h5>
      <form onSubmit={isEditing ? handleUpdate : handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={isEditing ? editingUser.name : user.name}
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
            value={isEditing ? editingUser.email : user.email}
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
            value={isEditing ? editingUser.phone : user.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
        </div>
        <button type="submit" className="btn btn-primary me-2" disabled={loading}>
          {loading ? (
            <><FaSpinner className="fa-spin me-2" />{isEditing ? 'Updating...' : 'Creating...'}</>
          ) : (
            isEditing ? 'Update User' : 'Create User'
          )}
        </button>
        {isEditing && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setIsEditing(false);
              setEditingUser(null);
              setErrors({});
            }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </form>
      <hr />
      <h5>All Users</h5>
      {loadingUsers ? (
        <div className="text-center">
          <FaSpinner className="fa-spin" /> Loading users...
        </div>
      ) : fetchError ? (
        <div className="alert alert-danger">{fetchError}</div>
      ) : allUsers.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEditClick(user)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default CreateUser;
