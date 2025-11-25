'use client';
import React, { useState, useEffect, useRef } from "react";
import '../../../../../dist/assets/vendor/aos/dist/aos.css';
import '../../../../../dist/assets/vendor/bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import validator from 'validator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faListOl, faListUl, faEraser } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL;

const Section2 = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    experience: "",
    certificates: "",
    description: "",
    section2_Tagline: "",
    section2_Image: "/assets/img/160x160/img8.jpg", // default
  });

  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [landingId, setLandingId] = useState(null);
  const editorRef = useRef(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    try {
      const response = await fetch(
        `https://appo.coinagesoft.com/api/landing/${adminId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // 🔥 If new admin (no data) → do NOT show error
      if (!response.ok) {
        console.warn("No profile data found for this admin.");
        setFormData({
          fullName: "",
          role: "",
          experience: "",
          certificates: "",
          description: "",
          section2_Tagline: "",
          section2_Image: "/assets/img/160x160/img8.jpg",
        });
        setLandingId(null);
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
        return;
      }

      const result = await response.json();
      const profile = result?.data || {};

      console.log("profile", profile);

      setLandingId(profile.id || null);

      // Handle certificates safely
      const certificates =
        profile.certificates && profile.certificates !== "null"
          ? profile.certificates
          : "";

      setFormData(prev => ({
        ...prev,
        fullName: profile.fullName || "",
        role: profile.role || "",
        experience: profile.experience || "",
        certificates: certificates|| "",
        description: profile.description || "",
        section2_Tagline: profile.section2_Tagline || "",
        section2_Image:
          profile.section2_Image &&
            profile.section2_Image !== "null"
            ? profile.section2_Image
            : "/assets/img/160x160/img8.jpg",
      }));

      // Load description into editor
      if (editorRef.current) {
        editorRef.current.innerHTML = profile.description || "";
      }

    } catch (error) {
      console.error("Error fetching consultant data:", error);
      toast.error("Failed to load section 2");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setIsEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // 👇 Instant preview before save
      setFormData(prev => ({
        ...prev,
        section2_Image: URL.createObjectURL(file),
      }));

      setIsEditing(true);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = formData.description || "";
    }
  }, [formData.description]);

  const handleValidation = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required.';
    if (!formData.role) newErrors.role = 'Role is required.';
    if (!formData.experience) newErrors.experience = 'Experience is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatText = (cmd) => {
    document.execCommand(cmd);
    setIsEditing(true);
  };



  const handleSave = async () => {
    if (!handleValidation()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const adminId = decoded.id;

      const updatedFormData = new FormData();
      updatedFormData.append("adminId", adminId);
      updatedFormData.append("description", formData.description || "");

      // Append other fields except description & image
      for (const key in formData) {
        if (key !== "section2_Image" && key !== "description") {
          updatedFormData.append(key, formData[key] || "");
        }
      }

      // Append image if selected
      if (imageFile) updatedFormData.append("section2_Image", imageFile);

      // Debug log
      for (let [key, value] of updatedFormData.entries()) {
        console.log(key, value);
      }

      let response;
      if (!landingId) {
        response = await axios.post(`https://appo.coinagesoft.com/api/landing`, updatedFormData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axios.patch(`https://appo.coinagesoft.com/api/landing/${landingId}`, updatedFormData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data.success) {
        toast.success("Section 2 saved successfully!");
        setIsEditing(false);
        setImageFile(null);
        if (!landingId) setLandingId(response.data.data.id);
        await fetchProfile();
      }
    } catch (error) {
      console.error("Error saving section2:", error);
      toast.error("Error saving section 2");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>

      <ToastContainer />
      <h5 className="text-muted mt-5 mb-4">Section 2 - Manage Consultant Info</h5>



      <div className="card p-4 shadow-sm">
        {/* Profile Image Upload */}
        <div className="text-center mb-4">
          <img
            src={
              formData.section2_Image
                ? formData.section2_Image.startsWith('blob:')
                  ? formData.section2_Image
                  : `https://appo.coinagesoft.com${formData.section2_Image}`
                : 'https://appo.coinagesoft.com/assets/img/160x160/img8.jpg'
            }
            alt="Section 2 Preview"
            id="section2_Image"
            className="rounded-circle border border-secondary"
            style={{ width: "160px", height: "160px", objectFit: "cover" }}
          />

          <div className="mt-3">
            <input
              type="file"
              className="form-control w-auto mx-auto"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <p className="mt-2 text-muted">Recommended size: 400x500</p>
        </div>

        {/* Profile Details */}
        <div className="row gx-4 gy-3">
          <div className="col-md-6">
            {["fullName", "role", "experience", "certificates"].map((field) => (
              <div className="row mb-3 align-items-center" key={field}>
                <label className="col-sm-4 col-form-label text-capitalize fw-semibold">
                  {field.replace(/([A-Z])/g, " $1")}:
                </label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    id={field}
                    className={`form-control editable ${errors[field] ? 'is-invalid' : ''}`}
                    value={formData[field] || ""}
                    onChange={handleChange}
                  />
                  {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-semibold">Description:</label>

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
                <button
                  className="btn btn-outline-secondary btn-sm ms-2"
                  onClick={() => (editorRef.current.innerHTML = '')}
                >
                  <FontAwesomeIcon icon={faEraser} />
                </button>
              </div>

              {/* Text Editor */}
              <div
                ref={editorRef}
                contentEditable
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                onInput={(e) => {
                  setFormData(prev => ({ ...prev, description: e.currentTarget.innerHTML }));
                  setIsEditing(true);
                }}
                style={{ minHeight: "150px", backgroundColor: "#fff", outline: "none", whiteSpace: "pre-wrap" }}
              />


              {errors.description && (
                <div className="invalid-feedback">{errors.description}</div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Tagline:</label>
              <input
                type="text"
                id="section2_Tagline"
                className={`form-control editable ${errors.section2_Tagline ? 'is-invalid' : ''}`}
                value={formData.section2_Tagline === null || formData.section2_Tagline === "null" ? "" : formData.section2_Tagline}
                onChange={handleChange}
              />

              {errors.section2_Tagline && <div className="invalid-feedback">{errors.section2_Tagline}</div>}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-primary px-4 rounded-pill mt-3"
            disabled={!isEditing || loading}
            onClick={handleSave}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default Section2;
