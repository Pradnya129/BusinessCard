'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSpinner, FaPlus } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return setLoading(false);
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://appo.coinagesoft.com/api/superadmin/manageAdmins/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data || []);
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    const validationErrors = {};
    if (!selectedUser.firstName?.trim()) validationErrors.firstName = 'First name required';
    if (!selectedUser.lastName?.trim()) validationErrors.lastName = 'Last name required';
    if (!selectedUser.email?.trim()) validationErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(selectedUser.email)) validationErrors.email = 'Email invalid';
    if (!selectedUser.phoneNumber?.trim()) validationErrors.phoneNumber = 'Phone required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setUpdating(true);
    try {
      const res = await axios.put(
        `https://appo.coinagesoft.com/api/superadmin/manageAdmins/${selectedUser.id}`,
        selectedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => (u.id === selectedUser.id ? res.data.admin : u)));
      setShowEditModal(false);
      setSelectedUser(null);
      setAlertMessage({ type: 'success', text: 'User updated successfully' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: 'Failed to update user' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    setDeleting(id);
    try {
      await axios.delete(`https://appo.coinagesoft.com/api/superadmin/manageAdmins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(u => u.id !== id));
      setAlertMessage({ type: 'success', text: 'User deleted successfully' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setDeleting(null);
    }
  };

  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'admin',
    userName: '',
    businessName: '',
    password: '',
    phoneNumber: ''
  });

  const handleCreateAdmin = async (newUser) => {
    const validationErrors = {};
    if (!newUser.firstName?.trim()) validationErrors.firstName = 'First name required';
    if (!newUser.lastName?.trim()) validationErrors.lastName = 'Last name required';
    if (!newUser.email?.trim()) validationErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(newUser.email)) validationErrors.email = 'Email invalid';
    if (!newUser.userName?.trim()) validationErrors.userName = 'Username required';
    if (!newUser.password?.trim()) validationErrors.password = 'Password required';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setUpdating(true);
    try {
      const res = await axios.post('https://appo.coinagesoft.com/api/superadmin/manageAdmins/', newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers([...users, res.data.admin]);
      setShowCreateModal(false);
      setNewAdmin({
        firstName: '',
        lastName: '',
        email: '',
        role: 'admin',
        userName: '',
        businessName: '',
        password: '',
        phoneNumber: ''
      });
      setAlertMessage({ type: 'success', text: 'Admin created successfully' });
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: 'Failed to create admin' });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <div className="card p-3 rounded-4 mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Total Users</h5>
        <button className="btn btn-success" onClick={() => setShowCreateModal(true)}>
          <FaPlus className="me-1" /> Create Admin
        </button>
      </div>

      {/* Alerts */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mb-3`}>
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}

      {/* Loading */}
      {loading && <div className="text-center py-4"><FaSpinner className="fa-spin me-2" /> Loading users...</div>}

      {/* No Users */}
      {!loading && users.length === 0 && <div className="text-center py-4 text-muted">No users found.</div>}

      {/* Table for desktop */}
      <div className="table-responsive d-none d-md-block">
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Sr. No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Business</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id || index}>
                <td>{index + 1}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.businessName}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(user)} disabled={updating || deleting === user.id}><FaEdit /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)} disabled={updating || deleting === user.id}>
                      {deleting === user.id ? <FaSpinner className="fa-spin" /> : <FaTrash />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="d-block d-md-none">
        {users.map((user, index) => (
          <div key={user.id || index} className="card mb-3 shadow-sm border rounded-lg p-3">
            <h6 className="fw-bold mb-2">#{index + 1} - {user.firstName} {user.lastName}</h6>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <p className="mb-1"><strong>Phone:</strong> {user.phoneNumber}</p>
            <p className="mb-1"><strong>Business:</strong> {user.businessName}</p>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(user)} disabled={updating || deleting === user.id}><FaEdit /> Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.id)} disabled={updating || deleting === user.id}>
                {deleting === user.id ? <FaSpinner className="fa-spin me-1" /> : <FaTrash />} Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {['firstName','lastName','email','phoneNumber'].map(field => (
                    <div className="mb-3" key={field}>
                      <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                        value={selectedUser[field]}
                        onChange={(e) => setSelectedUser({ ...selectedUser, [field]: e.target.value })}
                      />
                      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                    </div>
                  ))}
                  <div className="text-center mt-3">
                    <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={updating}>
                      {updating ? <><FaSpinner className="fa-spin me-2" />Saving...</> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header">
                <h5 className="modal-title">Create New Admin</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  {['firstName','lastName','email','userName','businessName','password','phoneNumber'].map(field => (
                    <div className="mb-3" key={field}>
                      <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input
                        type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'}
                        className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                        value={newAdmin[field]}
                        onChange={(e) => setNewAdmin({ ...newAdmin, [field]: e.target.value })}
                      />
                      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                    </div>
                  ))}
                  <div className="text-center mt-3">
                    <button type="button" className="btn btn-success" onClick={() => handleCreateAdmin(newAdmin)} disabled={updating}>
                      {updating ? <><FaSpinner className="fa-spin me-2" />Creating...</> : 'Create Admin'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default AdminUsers;
