'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const Section5 = () => {
  const [formData, setFormData] = useState({
    section5_Tagline: '',
    section5_MainHeading: '',
    section5_MainDescription: '',
  });

  const [editedData, setEditedData] = useState({ ...formData });
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const [isTaglineValid, setIsTaglineValid] = useState(true);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);

  // Fetch Section 5 data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://appo.coinagesoft.com/api/landing/${adminId}`, {
  headers: {
    "Authorization": `Bearer ${token}` // <-- Add this line
  },
});
        const data = res.data.data;

        const mappedData = {
          id: data.id, // add landing page ID here
          section5_Tagline: data.section5_Tagline || '',
          section5_MainDescription: data.section5_MainDescription || '',
          section5_MainHeading: data.section5_MainHeading || '',
        };

        setFormData(mappedData);
        setEditedData(mappedData);
        setStatusMessage({ type: '', text: '' });
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Failed to fetch section content.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
;

  // Detect form changes
useEffect(() => {
  const hasChanges =
    editedData?.section5_Tagline !== formData?.section5_Tagline ||
    editedData?.section5_MainDescription !== formData?.section5_MainDescription ||
    editedData?.section5_MainHeading !== formData?.section5_MainHeading;
  setIsEdited(hasChanges);
}, [editedData, formData]);


  // Handle input change
  const handleChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  // Validate the fields before saving
  const validateFields = () => {
    let isValid = true;

    if (!editedData.section5_Tagline.trim()) {
      setIsTaglineValid(false);
      isValid = false;
    } else setIsTaglineValid(true);

    if (!editedData.section5_MainDescription.trim()) {
      setIsDescriptionValid(false);
      isValid = false;
    } else setIsDescriptionValid(true);

    return isValid;
  };

const handleSave = async () => {
  if (!validateFields()) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);

    const landingPageId = editedData.id; // Use landing page ID here

    // Create FormData
    const formDataPayload = new FormData();
    formDataPayload.append("section5_Tagline", editedData.section5_Tagline);
    formDataPayload.append("section5_MainDescription", editedData.section5_MainDescription);
    formDataPayload.append("section5_MainHeading", editedData.section5_MainHeading);

    await axios.patch(`https://appo.coinagesoft.com/api/landing/${landingPageId}`, formDataPayload, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    // Update local state
    setFormData({ ...editedData });
    setIsEdited(false);
    setStatusMessage({ type: 'success', text: 'Section 5 updated successfully!' });
  } catch (err) {
    console.error(err);
    setStatusMessage({ type: 'error', text: 'Failed to update section.' });
  } finally {
    setLoading(false);
  }
};



  // Handle Reset
  const handleReset = () => {
    setEditedData(formData);
    setIsEdited(false);
    setStatusMessage({ type: '', text: '' });
  };

  return (
    <div className="my-5">
      <h5 className="text-muted mb-4">Section 5 - Manage Plan Taglines</h5>

      {statusMessage.text && (
        <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="card shadow-sm p-4">
        <div className="mb-3">
          <label className="form-label fw-semibold">Tagline</label>
          <input
            type="text"
            className={`form-control ${!isTaglineValid ? 'is-invalid' : ''}`}
            value={editedData?.section5_Tagline || ''}
            disabled={loading}
            onChange={e => handleChange('section5_Tagline', e.target.value)}
          />
          {!isTaglineValid && <div className="invalid-feedback">Tagline cannot be empty.</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Main Heading</label>
          <input
            type="text"
            className="form-control"
            value={editedData?.section5_MainHeading || ''}
            disabled={loading}
            onChange={e => handleChange('section5_MainHeading', e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            rows="4"
            className={`form-control ${!isDescriptionValid ? 'is-invalid' : ''}`}
            value={editedData.section5_MainDescription || ''}
            disabled={loading}
            onChange={e => handleChange('section5_MainDescription', e.target.value)}
          />
          {!isDescriptionValid && <div className="invalid-feedback">Description cannot be empty.</div>}
        </div>

      

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={!isEdited || loading}
          >
            Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!isEdited || loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section5;
