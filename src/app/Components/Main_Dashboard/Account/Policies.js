"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faListOl, faListUl, faEraser } from '@fortawesome/free-solid-svg-icons';
import {jwtDecode} from "jwt-decode"; // fixed import

const API_URL = "`https://appo.coinagesoft.com/api/admin/policy";

const Policies = () => {
  const [tenantId, setTenantId] = useState(null); // dynamic tenantId
  const [policyType, setPolicyType] = useState("terms");
  const [policy, setPolicy] = useState(null);
  const [newPolicy, setNewPolicy] = useState({ title: '', content: '' });
  const editorRef = useRef(null);

  // Decode tenantId from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setTenantId(decoded.tenantId); // assumes token has tenantId
    } catch (err) {
      console.error("Invalid token", err);
      toast.error("Invalid token");
    }
  }, []);

  // Fetch policy whenever tenantId or policyType changes
  useEffect(() => {
    if (!tenantId) return;

    const fetchPolicy = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(`${API_URL}/tenant/${tenantId}/${policyType}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data?.data || null;

        if (!data) {
          // Handle gracefully if no policy exists
          setPolicy(null);
          setNewPolicy({ title: '', content: '' });
          if (editorRef.current) editorRef.current.innerHTML = '';
          return;
        }

        setPolicy(data);
        setNewPolicy({ title: data.title || '', content: data.content || '' });
        if (editorRef.current) editorRef.current.innerHTML = data.content || '';
      } catch (err) {
        console.error(err);
        // Don't show error if no policy exists
        setPolicy(null);
        setNewPolicy({ title: '', content: '' });
        if (editorRef.current) editorRef.current.innerHTML = '';
      }
    };

    fetchPolicy();
  }, [tenantId, policyType]);

  const formatText = (cmd) => document.execCommand(cmd);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error("Token not found");

    const content = editorRef.current?.innerHTML || '';
    if (!newPolicy.title || !content) return toast.error("Fill all fields");

    try {
      if (policy) {
        // Update existing policy
        await axios.put(`${API_URL}/${policy.id}`, { title: newPolicy.title, content }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new policy if none exists
        await axios.post(API_URL, { tenantId, type: policyType, title: newPolicy.title, content }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      toast.success("Policy saved successfully!");
      setPolicy({ ...newPolicy }); // update local state
    } catch (err) {
      console.error(err);
      toast.error("Error saving policy");
    }
  };

  return (
    <div className="container py-3">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold m-0">Edit Policy</h4>
        <button className="btn btn-primary px-3 py-1 rounded-pill" onClick={handleSave}>Save</button>
      </div>

      {/* Policy Type Selector */}
      <div className="mb-3">
        <label className="fw-bold mb-1">Select Policy Type</label>
        <select className="form-select rounded-3" value={policyType} onChange={(e) => setPolicyType(e.target.value)}>
          <option value="terms">Terms & Conditions</option>
          <option value="privacy">Privacy Policy</option>
          <option value="shipping">Shipping Policy</option>
          <option value="cancellation">Cancellation Policy</option>
          <option value="contact">Contact Policy</option>
        </select>
      </div>

      {/* Title Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control rounded-3 mb-2"
          value={newPolicy.title}
          onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
          placeholder="Policy Title"
        />

        {/* Formatting Toolbar */}
        <div className="d-flex gap-2 flex-wrap mb-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('bold')}><FontAwesomeIcon icon={faBold} /></button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('italic')}><FontAwesomeIcon icon={faItalic} /></button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('underline')}><FontAwesomeIcon icon={faUnderline} /></button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertOrderedList')}><FontAwesomeIcon icon={faListOl} /></button>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => formatText('insertUnorderedList')}><FontAwesomeIcon icon={faListUl} /></button>
          <button type="button" className="btn btn-outline-secondary btn-sm ms-2" onClick={() => editorRef.current.innerHTML = ''}><FontAwesomeIcon icon={faEraser} /></button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className="form-control rounded-3"
          style={{ minHeight: '150px', outline: 'none', backgroundColor: '#fff', whiteSpace: 'pre-wrap' }}
        />
      </div>

      {/* Preview if policy exists */}
      {policy && (
        <div className="card">
          <div className="card-header">Existing Policy Preview</div>
          <div className="card-body">
            <h5>{policy.title}</h5>
            <div dangerouslySetInnerHTML={{ __html: policy.content }} style={{ whiteSpace: 'pre-wrap' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
