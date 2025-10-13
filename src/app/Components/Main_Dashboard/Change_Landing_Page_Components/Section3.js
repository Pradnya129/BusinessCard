'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faListOl, faListUl, faEraser } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || "https://appo.coinagesoft.com";

const Section3 = () => {
  const [tagline, setTagline] = useState('');
  const [landingId, setLandingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/assets/img/stethoscope.jpg');
  const [relatedImage, setRelatedImage] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef(null); // ✅ define here before using anywhere

  
  // 🟢 FETCH EXISTING DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded.id;

        const response = await fetch(`${API_URL}/api/landing/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        const data = result?.data || {};

        setLandingId(data.id || data._id);
        setTagline(data.section3_Tagline || '');
        if (editorRef.current) editorRef.current.innerHTML = data.section3_Description || '';
        setPreviewUrl(data.section3_Image ? `${API_URL}${data.section3_Image}` : '/assets/img/stethoscope.jpg');
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // 🟢 HANDLE IMAGE UPLOAD
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRelatedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsEdited(true);
    }
  };

  // 🟢 TEXT FORMAT BUTTONS
  const formatText = (cmd) => {
    document.execCommand(cmd);
    setIsEdited(true);
  };

  // 🟢 SAVE SECTION DATA
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Token not found");

    const content = editorRef.current?.innerHTML.trim() || '';
    if (!tagline.trim() || !content) return toast.error("All fields are required");

    try {
      const formData = new FormData();
      formData.append('section3_Tagline', tagline);
      formData.append('section3_Description', content);
      if (relatedImage) formData.append('section3_Image', relatedImage);

      setLoading(true);
      const response = await axios.patch(`${API_URL}/api/landing/${landingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
console.log("formdata",formData)
      if (response.status === 200) {
        toast.success("Section 3 updated successfully!");
        setIsEdited(false);
      }
    } catch (err) {
      console.error("Error saving section:", err);
      toast.error("Failed to save section.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss={false}  // make auto-close uninterrupted
  pauseOnHover={false}       // make auto-close uninterrupted
  draggable
/>
      <h5 className="text-start mb-4 text-muted mt-5">Section 3 - Manage Consultant Info</h5>

      <div className="card p-4">
        <div className="row align-items-start">
          {/* 🟦 Image Section */}
          <div className="col-md-4 text-center">
            <div className="border border-secondary rounded mx-auto"
              style={{ width: '150px', height: '150px', overflow: 'hidden' }}>
              <img src={previewUrl} alt="Section" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <input type="file" className="form-control mt-3 w-75 mx-auto"
              accept="image/*" onChange={handleImageChange} />
            <p className="mt-2 text-muted">Recommended size: 150x150</p>
          </div>

          {/* 🟩 Editor Section */}
          <div className="col-md-8">
            <div className="mb-3">
              <label className="form-label fw-semibold">Tagline:</label>
              <input
                type="text"
                className="form-control"
                value={tagline}
                onChange={(e) => { setTagline(e.target.value); setIsEdited(true); }}
              />
            </div>

            {/* Toolbar */}
            <div className="d-flex gap-2 flex-wrap mb-2">
              <button className="btn btn-outline-primary btn-sm" onClick={() => formatText('bold')}>
                <FontAwesomeIcon icon={faBold} />
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => formatText('italic')}>
                <FontAwesomeIcon icon={faItalic} />
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => formatText('underline')}>
                <FontAwesomeIcon icon={faUnderline} />
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertOrderedList')}>
                <FontAwesomeIcon icon={faListOl} />
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertUnorderedList')}>
                <FontAwesomeIcon icon={faListUl} />
              </button>
              <button className="btn btn-outline-secondary btn-sm ms-2" onClick={() => editorRef.current.innerHTML = ''}>
                <FontAwesomeIcon icon={faEraser} />
              </button>
            </div>

            {/* Text Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="form-control"
             onInput={() => setIsEdited(true)} 
              style={{
                minHeight: '200px',
                backgroundColor: '#fff',
                outline: 'none',
                whiteSpace: 'pre-wrap',
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary px-4 py-2 rounded-pill"
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
