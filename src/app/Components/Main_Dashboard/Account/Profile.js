'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

const EditableField = ({ label, icon, value, onSave, error }) => {
  const [edit, setEdit] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => setTempValue(value), [value]);

  const handleSave = () => {
    onSave(tempValue);
    setEdit(false);
  };

  return (
    <li className="d-flex align-items-center flex-wrap mb-2 w-100">
      <i className={`me-2 ${icon}`}></i>
      {label && <span className="fw-medium me-2">{label}</span>}
      {edit ? (
        <>
          <input
            className={`form-control d-inline w-auto ${error ? 'is-invalid' : ''}`}
            style={{ maxWidth: '200px' }}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
          <i
            className="ri-check-line text-success ms-2 cursor-pointer"
            onClick={handleSave}
            title="Save"
            style={{ fontSize: '1.2rem' }}
          ></i>
        </>
      ) : (
        <span
          onClick={() => setEdit(true)}
          className="cursor-pointer text-muted"
          style={{ minWidth: '120px' }}
        >
          {value || '—'}
        </span>
      )}
      {error && <div className="invalid-feedback">{error}</div>}
    </li>
  );
};

const handleImageUpload = (e, setUser) => {
  const file = e.target.files[0];
  if (file) setUser((prev) => ({ ...prev, profileImage: file }));
};

const ProfileModal = ({ user, setUser, onClose, onSave }) => {
  const fields = [
    'fullName',
    'role',
    'countries',
    'languages',
    'hospitalClinicAddress',
    'email',
    'experience',
    'joinDate',
  ];
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (!user[field])
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) =>
          str.toUpperCase()
        )} is required.`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    if (validate()) onSave(user);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header bg-primary text-white rounded-top-4">
            <h5 className="modal-title">Edit Profile</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            {fields.map((field) => (
              <div className="form-group mb-3" key={field}>
                <label className="fw-semibold">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </label>
                <input
                  type="text"
                  className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                  value={user[field] || ''}
                  onChange={(e) => setUser({ ...user, [field]: e.target.value })}
                />
                {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
              </div>
            ))}

            {/* Only Profile Image */}
            <div className="form-group mb-3">
              <label className="fw-semibold">Profile Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleImageUpload(e, setUser)}
              />
              {user.profileImage && (
                <img
                  src={
                    typeof user.profileImage === 'string'
                      ? `https://appointify.coinagesoft.com${user.profileImage}`
                      : URL.createObjectURL(user.profileImage)
                  }
                  alt="Profile Image"
                  className="mt-2 rounded"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
              )}
            </div>
          </div>
          <div className="modal-footer px-4 py-3">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [user, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [landingId, setLandingId] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  let adminId = null;
  if (token) {
    const decoded = jwtDecode(token);
    adminId = decoded.id;
  }

  useEffect(() => {
    if (!token || !adminId) return;
    axios
      .get(`https://appo.coinagesoft.com/api/landing/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;
        if (data) {
          setUser(data);
          setLandingId(data.id || data._id);
        }
      })
      .catch((err) => console.error('Error fetching profile:', err));
  }, [token, showModal, adminId]);

  const handleFieldUpdate = async (key, newValue) => {
    if (!landingId) return;
    const updatedUser = { ...user, [key]: newValue };
    setUser(updatedUser);

    try {
      await axios.patch(
        `https://appo.coinagesoft.com/api/landing/${landingId}`,
        { [key]: newValue },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
    } catch (err) {
      console.error('Error updating field:', err);
    }
  };

  const handleSaveProfile = async (newData) => {
    const formData = new FormData();
    Object.keys(newData).forEach((key) => {
      if (newData[key]) formData.append(key, newData[key]);
    });

    try {
      if (landingId) {
        await axios.patch(`https://appo.coinagesoft.com/api/landing/${landingId}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const res = await axios.post(`https://appo.coinagesoft.com/api/landing`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setLandingId(res.data.id || res.data._id);
      }
      setUser(newData);
      setShowModal(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  return (
    <main className="container-xxl flex-grow-1 container-p-y">
      <section className="row mb-5">
        <div className="col-12">
          <div className="nav-align-top mb-4">
            <ul className="nav nav-pills flex-column flex-md-row mb-4 gap-2 gap-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" href="/Dashboard/Profile">
                  <i className="ri-group-line me-2"></i> My Profile
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/Dashboard/Security">
                  <i className="ri-lock-line me-2"></i> Security
                </Link>
              </li>
            </ul>
          </div>

          <div className="card shadow border-0 rounded-4">
            <div className="user-profile-header d-flex flex-column flex-md-row align-items-center p-4 gap-4">
              <div className="text-center">
                <img
 src={
    user.profileImage
      ? user.profileImage.startsWith('blob:')
        ? user.profileImage
        : `https://appo.coinagesoft.com${user.profileImage}` // remove extra slash
      : 'https://appo.coinagesoft.com/assets/img/160x160/img8.jpg'
  }                  alt="Profile"
                  className="rounded-circle border shadow"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <div className="flex-grow-1">
                <h4 className="fw-bold mb-3">{user.fullName || 'Your Name'}</h4>
                <ul className="list-unstyled">
                  <EditableField label="Role:" icon="ri-palette-line" value={user.role} onSave={(val) => handleFieldUpdate('role', val)} />
                  <EditableField label="Join Date:" icon="ri-calendar-line" value={user.joinDate} onSave={(val) => handleFieldUpdate('joinDate', val)} />
                  <EditableField label="Languages:" icon="ri-chat-voice-line" value={user.languages} onSave={(val) => handleFieldUpdate('languages', val)} />
                  <EditableField label="Hospital/Clinic Address:" icon="ri-hospital-line" value={user.hospitalClinicAddress} onSave={(val) => handleFieldUpdate('hospitalClinicAddress', val)} />
                  <EditableField label="Email:" icon="ri-mail-line" value={user.email} onSave={(val) => handleFieldUpdate('email', val)} />
                  <EditableField label="Countries:" icon="ri-globe-line" value={user.countries} onSave={(val) => handleFieldUpdate('countries', val)} />
                </ul>
              </div>
            </div>
          </div>

          <div className="text-end mt-4">
            <button className="btn btn-outline-primary px-4 py-2 rounded-pill shadow-sm" onClick={() => setShowModal(true)}>
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {showModal && <ProfileModal user={user} setUser={setUser} onClose={() => setShowModal(false)} onSave={handleSaveProfile} />}
    </main>
  );
};

export default Profile;
