'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL || "https://appo.coinagesoft.com";

const Section3 = () => {
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [relatedImage, setRelatedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/assets/img/stethoscope.jpg');
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isTaglineValid, setIsTaglineValid] = useState(true);
  const [isDescriptionValid, setIsDescriptionValid] = useState(true);
  const [landingId, setLandingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        const response = await fetch(`${API_URL}/api/landing/${adminId}`);
        const data = await response.json();

        if (data && data.data) {
          const section3Data = data.data;
          setLandingId(section3Data.id || section3Data._id);
          setTagline(section3Data?.section3_Tagline || '');
          setDescription(section3Data?.section3_Description || '');
          setPreviewUrl(
            section3Data?.section3_Image
              ? `${API_URL}${section3Data.section3_Image}`
              : '/assets/img/stethoscope.jpg'
          );
          setStatusMessage({ type: '', text: '' });
        } else {
          setStatusMessage({ type: 'error', text: 'No data available for section 3' });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setStatusMessage({ type: 'error', text: 'Failed to fetch section 3 content.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // IMAGE CHANGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRelatedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsEdited(true);
    }
  };

  // SAVE TO DATABASE
  const handleSave = async () => {
    // Validate fields
    if (!tagline.trim()) {
      setIsTaglineValid(false);
      return;
    } else {
      setIsTaglineValid(true);
    }

    if (!description.trim()) {
      setIsDescriptionValid(false);
      return;
    } else {
      setIsDescriptionValid(true);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append('section3_Tagline', tagline);
      formData.append('section3_Description', description);

      if (relatedImage) {
        formData.append('section3_Image', relatedImage); // only if new image selected
      }

      setLoading(true);
      const response = await axios.patch(
        `${API_URL}/api/landing/${landingId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`, // include token
          },
        }
      );

      if (response.status === 200) {
        setLandingId(response.data.data.id || response.data.data._id);
        setStatusMessage({ type: 'success', text: 'Section 3 updated successfully!' });
        setIsEdited(false);
      } else {
        setStatusMessage({ type: 'error', text: 'Failed to update Section 3' });
      }
    } catch (error) {
      console.error('Error updating section 3:', error);
      setStatusMessage({ type: 'error', text: 'An error occurred while saving Section 3.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h5 className="text-start mb-4 text-muted mt-5">Section 3 - Manage Consultant Info</h5>
      {statusMessage.text && (
        <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {statusMessage.text}
        </div>
      )}
      <div className="card p-4">
        {/* Image Upload */}
        <div className="row align-items-center mb-4">
          <div className="col-md-4 text-center">
            <div
              className="border border-secondary rounded mx-auto"
              style={{ width: '150px', height: '150px', overflow: 'hidden' }}
            >
              <img
                src={previewUrl}
                alt="Related"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <input
              type="file"
              className="form-control mt-3 w-75 mx-auto"
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="mt-2 text-muted">Recommended size: 150x150</p>
          </div>

          <div className="col-md-8">
            {/* Tagline Input */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Tagline:</label>
              <input
                type="text"
                className={`form-control editable ${!isTaglineValid ? 'is-invalid' : ''}`}
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setIsEdited(true);
                }}
              />
              {!isTaglineValid && <div className="invalid-feedback">Tagline is required.</div>}
            </div>

            {/* Description Input */}
            <div>
              <label className="form-label fw-semibold">Description:</label>
              <textarea
                className={`form-control editable ${!isDescriptionValid ? 'is-invalid' : ''}`}
                rows="4"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsEdited(true);
                }}
              />
              {!isDescriptionValid && <div className="invalid-feedback">Description is required.</div>}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            className="btn btn-primary px-4 py-2 rounded-pill mt-3"
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

export default Section3;
