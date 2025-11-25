'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from 'react-toastify';

const Section5 = () => {
  const [formData, setFormData] = useState({
    section5_Tagline: '',
    section5_MainHeading: '',
    section5_MainDescription: '',
  });

  const [editedData, setEditedData] = useState({ ...formData });
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const res = await axios.get(
        `https://appo.coinagesoft.com/api/landing/${adminId}`,
        {
          validateStatus: () => true, // ← prevents axios from auto-throwing errors
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // -------- HANDLE 404 WITHOUT ERROR --------
      if (res.status === 404) {
        console.warn("No landing entry for this admin → loading empty form.");

        const emptyData = {
          id: null,
          section5_Tagline: "",
          section5_MainDescription: "",
          section5_MainHeading: "",
        };

        setFormData(emptyData);
        setEditedData(emptyData);
        return;
      }
      // -----------------------------------------

      // All other non-200 errors → show toast
      if (res.status !== 200) {
        toast.error("Failed to fetch section content.");
        return;
      }

      const data = res.data.data || {};

      const mappedData = {
        id: data.id || null,
        section5_Tagline: data.section5_Tagline || "",
        section5_MainDescription: data.section5_MainDescription || "",
        section5_MainHeading: data.section5_MainHeading || "",
      };

      setFormData(mappedData);
      setEditedData(mappedData);

    } catch (err) {
      console.error("Error fetching section:", err);
      toast.error("Error fetching section content.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



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

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Token not found");

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    const landingPageId = editedData.id;

    // Create FormData
    const formDataPayload = new FormData();
    formDataPayload.append("adminId", adminId);
    formDataPayload.append("section5_Tagline", editedData.section5_Tagline);
    formDataPayload.append("section5_MainDescription", editedData.section5_MainDescription);
    formDataPayload.append("section5_MainHeading", editedData.section5_MainHeading);

    let response;

    // ---------- CREATE (POST) ----------
    if (!landingPageId) {
      response = await axios.post(`https://appo.coinagesoft.com/api/landing`, formDataPayload, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    } 
    // ---------- UPDATE (PATCH) ----------
    else {
      response = await axios.patch(`https://appo.coinagesoft.com/api/landing/${landingPageId}`, formDataPayload, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // ---------- SUCCESS ----------
    if (response.status === 200 || response.status === 201) {
      toast.success(
        landingPageId ? "Section 5 updated successfully!" : "Section 5 created successfully!"
      );

      setFormData({ ...editedData });
      setIsEdited(false);

      // If it’s newly created, save new ID
      if (!landingPageId) {
        setFormData(prev => ({ ...prev, id: response.data.data.id }));
      }

      await fetchProfile();
    } else {
      toast.error("Failed to save section 5.");
    }
  } catch (err) {
    console.error("Error saving section5:", err);
  } finally {
    setLoading(false);
  }
};




  // Handle Reset
  const handleReset = () => {
    setEditedData(formData);
    setIsEdited(false);
  };

  return (
    <div className="my-5">
         <ToastContainer />
      
      <h5 className="text-muted mb-4">Section 5 - Manage Plan Taglines</h5>

   

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
