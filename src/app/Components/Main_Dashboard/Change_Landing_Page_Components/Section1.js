'use client';
import React, { useEffect, useState } from "react";
import '../../../../../dist/assets/vendor/aos/dist/aos.css';
import '../../../../../dist/assets/vendor/bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL;

const emptySectionData = {
  fullName: "",
  role: "",
  experience: "",
  email: "",
  hospitalClinicAddress: "",
  locationURL: "",
  facebookId: "",
  instagramId: "",
  twitterId: "",
  youtubeId: "",
  tagline1: "",
  tagline2: "",
  tagline3: "",
  profileImage: "",
};

const Section1 = () => {
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [data, setData] = useState(null);
  const [editableData, setEditableData] = useState(emptySectionData);
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [landingId, setLandingId] = useState(null);


useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(token);
      const adminId = decoded.id;

      const response = await fetch(`http://103.224.247.28:5000/api/landing/${adminId}`);
      if (!response.ok) throw new Error("Failed to fetch consultant data");

      const result = await response.json();
      console.log("section1", result.data);

      if (result && result.data) {
        setData(result.data);
        setEditableData(result.data);
        setLandingId(result.data.id); // ✅ save landing id for later PATCH
      } else {
        setData(emptySectionData);
        setEditableData(emptySectionData);
        setLandingId(null);
      }

      setStatusMessage({ type: '', text: '' });
    } catch (error) {
      console.error("Error fetching consultant data:", error);
      setStatusMessage({ type: 'error', text: 'Failed to fetch section content.' });
      setData(emptySectionData);
      setEditableData(emptySectionData);
      setLandingId(null);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleInputChange = (field, value) => {
    setEditableData({ ...editableData, [field]: value });
    setIsEdited(true);
  };

  const handleSocialLinkChange = (platform, value) => {
    setEditableData((prev) => ({
      ...prev,
      [platform]: value,
    }));
    setIsEdited(true);
  };

  const validateForm = () => {
    let formErrors = {};
    if (!editableData.fullName) formErrors.fullName = "Full Name is required";
    if (!editableData.role) formErrors.role = "Designation is required";
    if (!editableData.experience) formErrors.experience = "Experience is required";
    if (!editableData.email || !/\S+@\S+\.\S+/.test(editableData.email)) formErrors.email = "Valid Email is required";
    if (!editableData.hospitalClinicAddress) formErrors.hospitalClinicAddress = "Clinic Address is required";
    if (!editableData.locationURL || !/^(ftp|http|https):\/\/[^ "]+$/.test(editableData.locationURL)) {
      formErrors.locationURL = "Valid Clinic Address URL is required";
    }
    ['facebookId', 'instagramId', 'twitterId', 'youtubeId'].forEach(platform => {
      if (editableData[platform] && !/^(ftp|http|https):\/\/[^ "]+$/.test(editableData[platform])) {
        formErrors[platform] = `Valid URL is required for ${platform}`;
      }
    });
    ["tagline1", "tagline2", "tagline3"].forEach((tagline) => {
      if (!editableData[tagline]) formErrors[tagline] = `${tagline} is required`;
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

 const handleSave = async () => {
  if (!validateForm()) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);

    const formData = new FormData();

    Object.entries(editableData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    if (profileImageFile) {
      formData.append('profileImage', profileImageFile);
    }
   

    const response = await axios.patch(
      `http://103.224.247.28:5000/api/landing/${landingId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.success) {
      setStatusMessage({ type: 'success', text: 'Section 1 updated successfully!' });
      setIsEdited(false);
    } else {
      setStatusMessage({ type: 'error', text: response.data.message || 'Failed to update profile!' });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    setStatusMessage({ type: 'error', text: error.message });
  }
};


  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="mb-5">
      <h5 className="mb-4 text-muted">Section 1 - Manage Banner Info</h5>
      {statusMessage.text && (
        <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {statusMessage.text}
        </div>
      )}
      <div className="card p-4 shadow-sm rounded-4">

        {/* Profile Image */}
        <div className="row g-4 justify-content-center mb-4">
          <div className="col-md-6 text-center">
          <img
  src={
    editableData.profileImage
      ? editableData.profileImage.startsWith('blob:')
        ? editableData.profileImage
        : `http://103.224.247.28:5000${editableData.profileImage}` // remove extra slash
      : 'http://103.224.247.28:5000/assets/img/160x160/img8.jpg'
  }
  alt="Profile"
  className="border border-secondary rounded-circle"
  style={{ width: "150px", height: "150px", objectFit: "cover" }}
/>

            <input
              type="file"
              className="form-control w-75 mx-auto mt-3"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setProfileImageFile(file);
                  setEditableData((prev) => ({
                    ...prev,
                    profileImage: URL.createObjectURL(file),
                  }));
                  setIsEdited(true);
                }
              }}
            />
            <p className="text-muted mt-1">Recommended size: 160x160</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="row gx-5">
          <div className="col-md-6">
            {[
              ["Full Name", "fullName"],
              ["Designation", "role"],
              ["Experience", "experience"],
            ].map(([label, field]) => (
              <div className="mb-3" key={field}>
                <label className="form-label fw-semibold">{label}</label>
                <input
                  type="text"
                  className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                  value={editableData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                />
                {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
              </div>
            ))}
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={editableData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Clinic Address</label>
              <input
                type="text"
                className={`form-control ${errors.hospitalClinicAddress ? 'is-invalid' : ''}`}
                value={editableData.hospitalClinicAddress}
                onChange={(e) => handleInputChange("hospitalClinicAddress", e.target.value)}
              />
              {errors.hospitalClinicAddress && <div className="invalid-feedback">{errors.hospitalClinicAddress}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Clinic Address URL</label>
              <input
                type="text"
                className={`form-control ${errors.locationURL ? 'is-invalid' : ''}`}
                value={editableData.locationURL}
                onChange={(e) => handleInputChange("locationURL", e.target.value)}
              />
              {errors.locationURL && <div className="invalid-feedback">{errors.locationURL}</div>}
            </div>
          </div>
        </div>

        {/* Social Media + Taglines */}
        <div className="row gx-5 mt-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Social Media</label>
            {[
              { platform: 'facebookId', icon: 'bi-facebook' },
              { platform: 'instagramId', icon: 'bi-instagram' },
              { platform: 'twitterId', icon: 'bi-twitter' },
            ].map(({ platform, icon }) => (
              <div className="input-group mb-2" key={platform}>
                <span className="input-group-text">
                  <i className={icon}></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${errors[platform] ? 'is-invalid' : ''}`}
                  value={editableData[platform] || ''}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                />
                {errors[platform] && <div className="invalid-feedback">{errors[platform]}</div>}
              </div>
            ))}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Taglines</label>
            {["tagline1", "tagline2", "tagline3"].map((tagline, idx) => (
              <div className="mb-2" key={tagline}>
                <label className="form-label">{`Tagline ${idx + 1}`}</label>
                <input
                  type="text"
                  className={`form-control ${errors[tagline] ? 'is-invalid' : ''}`}
                  value={editableData[tagline] || ""}
                  onChange={(e) => handleInputChange(tagline, e.target.value)}
                />
                {errors[tagline] && <div className="invalid-feedback">{errors[tagline]}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary px-4 py-2 rounded-pill"
            disabled={!isEdited || loading}
            onClick={handleSave}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section1;
